import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { BookingRequestSchema } from "@/lib/validation/booking";
import { getPriceById } from "@/content/pricing";
import { getInventoryKey } from "@/lib/admin/inventory";
import { checkRangeAvailability } from "@/lib/admin/availability";
import {
  PRIVATE_BOOKING_CUTOFF_HOURS,
  isSlotWithinCutoff,
} from "@/content/schedule";

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = BookingRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid booking request", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const data = parsed.data;

    const pkg = getPriceById(data.price_id);
    if (!pkg) {
      return NextResponse.json({ error: "Unknown price_id" }, { status: 400 });
    }
    if (!pkg.stripePriceId) {
      return NextResponse.json(
        { error: "Stripe price not configured. Run npm run stripe:seed." },
        { status: 500 },
      );
    }
    if (pkg.price === null) {
      return NextResponse.json(
        { error: "Price not yet set for this item" },
        { status: 500 },
      );
    }

    // Enforce 12h cutoff for online private bookings. Below the cutoff the
    // client must reach us on WhatsApp so we can coordinate on short notice.
    if (data.type === "private" && data.time_slot) {
      const slotDate = new Date(`${data.start_date}T00:00:00`);
      if (isSlotWithinCutoff(slotDate, data.time_slot)) {
        return NextResponse.json(
          {
            error: `Online booking requires at least ${PRIVATE_BOOKING_CUTOFF_HOURS}h notice. Please contact us on WhatsApp.`,
          },
          { status: 400 },
        );
      }
    }

    const totalAmount = pkg.price * data.num_participants;

    // Capacity check for accommodation bookings
    const inventoryKey = getInventoryKey(data.price_id);
    if (inventoryKey && data.start_date && data.end_date) {
      const check = await checkRangeAvailability(
        inventoryKey,
        data.start_date,
        data.end_date,
      );
      if (!check.ok) {
        return NextResponse.json(
          {
            error: `Sold out on ${check.conflictDate}. Please choose different dates.`,
          },
          { status: 409 },
        );
      }
    }

    const supabase = createAdminClient();
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        type: data.type,
        status: "pending",
        price_id: data.price_id,
        price_amount: totalAmount,
        num_participants: data.num_participants,
        start_date: data.start_date,
        end_date: data.end_date ?? null,
        time_slot: data.time_slot ?? null,
        camp: data.camp,
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        client_nationality: data.client_nationality ?? null,
        notes: data.notes ?? null,
      })
      .select("id")
      .single();

    if (error || !booking) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 },
      );
    }

    // If this is a private session, create an availability block for the slot
    if (data.type === "private" && data.time_slot) {
      await supabase
        .from("availability_blocks")
        .insert({
          date: data.start_date,
          type: "private-slot",
          time_slot: data.time_slot,
          is_blocked: true,
          reason: `Booking ${booking.id}`,
        });
    }

    // Build success/cancel URLs from the actual request origin.
    // This works in dev (localhost:3000) and prod without depending on
    // NEXT_PUBLIC_SITE_URL, which is set for SSR metadata and may legitimately
    // point to the production domain even when we are running locally.
    const origin =
      request.headers.get("origin") ??
      (() => {
        const host = request.headers.get("host");
        const proto =
          request.headers.get("x-forwarded-proto") ??
          (host?.startsWith("localhost") ? "http" : "https");
        return host ? `${proto}://${host}` : "http://localhost:3000";
      })();

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: pkg.stripePriceId,
          quantity: data.num_participants,
        },
      ],
      metadata: {
        booking_id: booking.id,
      },
      customer_email: data.client_email,
      success_url: `${origin}/booking/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/booking?cancelled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
