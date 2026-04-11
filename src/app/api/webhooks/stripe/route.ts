import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendBookingConfirmationEmail,
  sendAdminNotificationEmail,
} from "@/lib/email/send";
import type { BookingEmailData } from "@/lib/email/types";

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
    const bookingId = session.metadata?.booking_id;

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
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;

    if (bookingId) {
      await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);
    }
  }

  return NextResponse.json({ received: true });
}
