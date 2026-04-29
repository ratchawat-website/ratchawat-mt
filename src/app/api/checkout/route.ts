import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { BookingRequestSchema } from "@/lib/validation/booking";
import { getPriceById, getStripePriceId } from "@/content/pricing";
import { getInventoryKey } from "@/lib/admin/inventory";
import { checkRangeAvailability } from "@/lib/admin/availability";
import { getCheckoutOrigin } from "@/lib/utils/origin";
import { verifyTurnstile } from "@/lib/security/turnstile";
import {
  PRIVATE_SLOT_CAPACITY,
  isSlotWithinCutoff,
  getCutoffHoursForSlot,
} from "@/content/schedule";

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const captcha = await verifyTurnstile(
      typeof body?.cf_turnstile_token === "string"
        ? body.cf_turnstile_token
        : null,
      request,
    );
    if (captcha) return captcha;

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
    const stripePriceId = getStripePriceId(pkg);
    if (!stripePriceId) {
      return NextResponse.json(
        { error: "Stripe price not configured for current mode. Run npm run stripe:seed." },
        { status: 500 },
      );
    }
    if (pkg.price === null) {
      return NextResponse.json(
        { error: "Price not yet set for this item" },
        { status: 500 },
      );
    }

    // Private bookings: enforce slot-aware lead time (12h for 7:00/8:00,
    // 2h otherwise) + per-camp slot capacity.
    if (data.type === "private" && data.time_slot) {
      const slotDate = new Date(`${data.start_date}T00:00:00`);
      if (isSlotWithinCutoff(slotDate, data.time_slot)) {
        const cutoff = getCutoffHoursForSlot(data.time_slot);
        return NextResponse.json(
          {
            error: `Online booking requires at least ${cutoff}h notice for this slot. Please contact us on WhatsApp.`,
          },
          { status: 400 },
        );
      }

      const supabaseCheck = createAdminClient();

      // Hard closure: admin toggled the slot off for everyone, regardless
      // of the per-camp trainer capacity. One row is enough to refuse.
      const { count: closureCount, error: closureError } = await supabaseCheck
        .from("availability_blocks")
        .select("id", { count: "exact", head: true })
        .eq("type", "private-slot-closure")
        .eq("is_blocked", true)
        .eq("date", data.start_date)
        .eq("time_slot", data.time_slot);
      if (closureError) {
        console.error("Closure check failed:", closureError);
        return NextResponse.json(
          { error: "Could not verify slot availability. Please try again." },
          { status: 500 },
        );
      }
      if ((closureCount ?? 0) > 0) {
        return NextResponse.json(
          {
            error:
              "This slot is closed on the selected date. Please pick another time.",
          },
          { status: 409 },
        );
      }

      const { count, error: countError } = await supabaseCheck
        .from("availability_blocks")
        .select("id", { count: "exact", head: true })
        .eq("type", "private-slot")
        .eq("is_blocked", true)
        .eq("date", data.start_date)
        .eq("time_slot", data.time_slot)
        .eq("camp", data.camp);
      if (countError) {
        console.error("Capacity check failed:", countError);
        return NextResponse.json(
          { error: "Could not verify slot availability. Please try again." },
          { status: 500 },
        );
      }
      if ((count ?? 0) >= PRIVATE_SLOT_CAPACITY) {
        return NextResponse.json(
          {
            error:
              "This slot is fully booked at the selected camp. Please pick another time or camp.",
          },
          { status: 409 },
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
          camp: data.camp,
          is_blocked: true,
          reason: `Booking ${booking.id}`,
        });
    }

    const origin = getCheckoutOrigin(request);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
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
