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

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

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

    if (!bookingId) {
      console.error("Missing booking_id in session metadata");
      return NextResponse.json({ received: true });
    }

    const { data: updated, error } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        stripe_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        stripe_payment_status: session.payment_status,
      })
      .eq("id", bookingId)
      .select("*")
      .single();

    if (error || !updated) {
      console.error("Failed to update booking:", error);
      return NextResponse.json({ received: true });
    }

    const bookingData: BookingEmailData = {
      id: updated.id,
      type: updated.type,
      price_id: updated.price_id,
      price_amount: updated.price_amount,
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
    };

    try {
      await Promise.all([
        sendBookingConfirmationEmail(bookingData),
        sendAdminNotificationEmail(bookingData),
      ]);
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
    }

    // Ensure a private-slot block exists for confirmed private sessions
    // (idempotent: checkout route creates it on booking insert, this is a safety net)
    if (updated.type === "private" && updated.time_slot) {
      // Check by reason (tied to this booking) so duplicate inserts for
      // the same booking are avoided while still allowing up to
      // PRIVATE_SLOT_CAPACITY distinct bookings per (date, slot, camp).
      const { data: existingBlock } = await supabase
        .from("availability_blocks")
        .select("id")
        .eq("reason", `Booking ${bookingId}`)
        .maybeSingle();

      if (!existingBlock) {
        await supabase
          .from("availability_blocks")
          .insert({
            date: updated.start_date,
            type: "private-slot",
            time_slot: updated.time_slot,
            camp: updated.camp,
            is_blocked: true,
            reason: `Booking ${bookingId}`,
          });
      }
    }
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};

    if (meta.type === "dtv" && meta.dtv_application_id) {
      await supabase
        .from("dtv_applications")
        .update({ status: "cancelled" })
        .eq("id", meta.dtv_application_id);
    } else if (meta.booking_id) {
      await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", meta.booking_id);
    }
  }

  return NextResponse.json({ received: true });
}
