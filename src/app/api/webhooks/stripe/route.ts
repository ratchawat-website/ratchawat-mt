import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendBookingConfirmationEmail,
  sendAdminNotificationEmail,
  sendDtvApplicationReceivedEmail,
  sendDtvAdminNotificationEmail,
} from "@/lib/email/send";
import type { BookingEmailData } from "@/lib/email/types";
import type { DtvApplicationEmailData } from "@/lib/email/templates/DTVApplicationReceived";
import { getPriceById } from "@/content/pricing";
import { getCapacityUnits } from "@/lib/booking/pricing";

// Stripe.webhooks.constructEvent uses Node crypto and is not Edge-safe.
export const runtime = "nodejs";

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set; rejecting webhook");
    return NextResponse.json(
      { error: "Webhook misconfigured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Idempotency: insert event.id into processed_stripe_events.
  // Unique violation (23505) means we have already handled this event;
  // return 200 so Stripe stops retrying.
  const { error: dedupErr } = await supabase
    .from("processed_stripe_events")
    .insert({ event_id: event.id, event_type: event.type });

  if (dedupErr) {
    if (dedupErr.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("Dedup insert failed:", dedupErr);
    return NextResponse.json({ error: "Dedup failed" }, { status: 500 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};

    // DTV application flow
    if (meta.type === "dtv") {
      const applicationId = meta.dtv_application_id;
      if (!applicationId) {
        console.error("Missing dtv_application_id in session metadata");
        return NextResponse.json({ received: true });
      }

      const { data: app, error: dtvErr } = await supabase
        .from("dtv_applications")
        .update({
          status: "paid",
          stripe_session_id: session.id,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
          stripe_payment_status: session.payment_status,
        })
        .eq("id", applicationId)
        .select("*")
        .single();

      if (dtvErr || !app) {
        console.error("Failed to update DTV application:", dtvErr);
        return NextResponse.json({ received: true });
      }

      const appData: DtvApplicationEmailData = {
        id: app.id,
        first_name: app.first_name,
        last_name: app.last_name,
        email: app.email,
        phone: app.phone,
        nationality: app.nationality,
        date_of_birth: app.date_of_birth,
        passport_number: app.passport_number,
        passport_expiry: app.passport_expiry,
        currently_in_thailand: app.currently_in_thailand,
        training_start_date: app.training_start_date,
        arrival_date: app.arrival_date,
        price_id: app.price_id,
        price_amount: app.price_amount,
      };

      try {
        await Promise.all([
          sendDtvApplicationReceivedEmail(appData),
          sendDtvAdminNotificationEmail(appData),
        ]);
      } catch (emailErr) {
        console.error("DTV email send failed:", emailErr);
      }

      return NextResponse.json({ received: true });
    }

    const bookingId = meta.booking_id;
    const groupId = meta.booking_group_id;

    if (!bookingId) {
      console.error("Missing booking_id in session metadata");
      return NextResponse.json({ received: true });
    }

    const updatePayload = {
      status: "confirmed" as const,
      stripe_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
      stripe_payment_status: session.payment_status,
    };

    // Multi-session carts confirm the whole group; legacy bookings and
    // other types keep the single-row path.
    const query = groupId
      ? supabase
          .from("bookings")
          .update(updatePayload)
          .eq("booking_group_id", groupId)
      : supabase.from("bookings").update(updatePayload).eq("id", bookingId);

    const { data: updatedRows, error } = await query.select("*");

    if (error || !updatedRows || updatedRows.length === 0) {
      console.error("Failed to update booking(s):", error);
      return NextResponse.json({ received: true });
    }

    // Sort sessions chronologically; the first row feeds the email header.
    const sorted = [...updatedRows].sort((a, b) =>
      `${a.start_date}${a.time_slot ?? ""}`.localeCompare(
        `${b.start_date}${b.time_slot ?? ""}`,
      ),
    );
    const updated = sorted[0];
    const totalAmount = sorted.reduce((sum, b) => sum + b.price_amount, 0);

    const bookingData: BookingEmailData = {
      id: updated.id,
      type: updated.type,
      price_id: updated.price_id,
      price_amount: totalAmount,
      start_date: updated.start_date,
      end_date: updated.end_date,
      time_slot: updated.time_slot,
      camp: updated.camp,
      num_participants: updated.num_participants,
      client_name: updated.client_name,
      client_email: updated.client_email,
      client_phone: updated.client_phone,
      client_nationality: updated.client_nationality,
      notes: updated.notes,
      sessions:
        sorted.length > 1
          ? sorted.map((b) => ({
              date: b.start_date,
              time_slot: b.time_slot ?? "",
            }))
          : undefined,
    };

    try {
      await Promise.all([
        sendBookingConfirmationEmail(bookingData),
        sendAdminNotificationEmail(bookingData),
      ]);
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
    }

    // Ensure a private-slot block exists for every confirmed private session
    // (idempotent: checkout route creates them on booking insert, this is a
    // safety net). Check by reason (tied to each booking) so duplicate
    // inserts are avoided while still allowing up to PRIVATE_SLOT_CAPACITY
    // units per (date, slot, camp).
    for (const b of sorted) {
      if (b.type !== "private" || !b.time_slot) continue;
      const { data: existingBlock } = await supabase
        .from("availability_blocks")
        .select("id")
        .eq("reason", `Booking ${b.id}`)
        .maybeSingle();

      if (!existingBlock) {
        await supabase
          .from("availability_blocks")
          .insert({
            date: b.start_date,
            type: "private-slot",
            time_slot: b.time_slot,
            camp: b.camp,
            units: getCapacityUnits(
              getPriceById(b.price_id) ?? {},
              b.num_participants,
            ),
            is_blocked: true,
            reason: `Booking ${b.id}`,
          });
      }
    }
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};

    // Race-safe: only cancel if still pending. Prevents an out-of-order
    // `expired` event from undoing a successful `completed`.
    if (meta.type === "dtv" && meta.dtv_application_id) {
      await supabase
        .from("dtv_applications")
        .update({ status: "cancelled" })
        .eq("id", meta.dtv_application_id)
        .eq("status", "pending");
    } else if (meta.booking_id) {
      // Multi-session carts cancel the whole group; legacy bookings keep
      // the single-row path. Only rows still pending are cancelled: an
      // out-of-order `expired` after `completed` matches no row and must
      // not delete a paid booking's block.
      const groupId = meta.booking_group_id;
      const query = groupId
        ? supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("booking_group_id", groupId)
            .eq("status", "pending")
        : supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("id", meta.booking_id)
            .eq("status", "pending");

      const { data: cancelledRows } = await query.select("id, type, time_slot");

      const blockReasons = (cancelledRows ?? [])
        .filter((b) => b.type === "private" && b.time_slot)
        .map((b) => `Booking ${b.id}`);
      if (blockReasons.length > 0) {
        await supabase
          .from("availability_blocks")
          .delete()
          .in("reason", blockReasons);
      }
    }
  }

  return NextResponse.json({ received: true });
}
