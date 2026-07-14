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
import {
  hasSlotCapacity,
  isSlotClosed,
  getSlotOccupancy,
} from "@/lib/booking/capacity";
import {
  computeBookingAmount,
  getStripeQuantity,
  getCapacityUnits,
  getParticipantBounds,
} from "@/lib/booking/pricing";

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

    const bounds = getParticipantBounds(pkg);
    if (
      data.num_participants < bounds.min ||
      data.num_participants > bounds.max
    ) {
      return NextResponse.json(
        {
          error: `This package accepts ${bounds.min} to ${bounds.max} participant(s).`,
        },
        { status: 400 },
      );
    }

    // Private bookings: enforce slot-aware lead time (12h before 09:30,
    // 2h otherwise) + per-camp slot capacity.
    const units = getCapacityUnits(pkg, data.num_participants);
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

      try {
        if (await isSlotClosed(supabaseCheck, data.start_date, data.time_slot)) {
          return NextResponse.json(
            {
              error:
                "This slot is closed on the selected date. Please pick another time.",
            },
            { status: 409 },
          );
        }
        const occupied = await getSlotOccupancy(supabaseCheck, {
          date: data.start_date,
          timeSlot: data.time_slot,
          camp: data.camp as "bo-phut" | "plai-laem",
        });
        if (!hasSlotCapacity(occupied, units)) {
          return NextResponse.json(
            {
              error:
                "This slot is fully booked at the selected camp. Please pick another time or camp.",
            },
            { status: 409 },
          );
        }
      } catch (checkErr) {
        console.error("Slot availability check failed:", checkErr);
        return NextResponse.json(
          { error: "Could not verify slot availability. Please try again." },
          { status: 500 },
        );
      }
    }

    const totalAmount = computeBookingAmount(pkg, data.num_participants);

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

    // If this is a private session, create an availability block for the slot.
    // Insert-then-verify: two concurrent checkouts can both pass the capacity
    // pre-check, so we re-count AFTER inserting our own block and roll back
    // if the slot overflowed.
    if (data.type === "private" && data.time_slot) {
      const { error: blockErr } = await supabase
        .from("availability_blocks")
        .insert({
          date: data.start_date,
          type: "private-slot",
          time_slot: data.time_slot,
          camp: data.camp,
          units,
          is_blocked: true,
          reason: `Booking ${booking.id}`,
        });
      if (blockErr) {
        console.error("Slot block insert failed:", blockErr);
        await supabase.from("bookings").delete().eq("id", booking.id);
        return NextResponse.json(
          { error: "Could not reserve the slot. Please try again." },
          { status: 500 },
        );
      }

      const occupiedAfter = await getSlotOccupancy(supabase, {
        date: data.start_date,
        timeSlot: data.time_slot,
        camp: data.camp as "bo-phut" | "plai-laem",
      });
      if (occupiedAfter > PRIVATE_SLOT_CAPACITY) {
        await supabase
          .from("availability_blocks")
          .delete()
          .eq("reason", `Booking ${booking.id}`);
        await supabase.from("bookings").delete().eq("id", booking.id);
        return NextResponse.json(
          {
            error:
              "This slot just filled up at the selected camp. Please pick another time or camp.",
          },
          { status: 409 },
        );
      }
    }

    const origin = getCheckoutOrigin(request);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: getStripeQuantity(pkg, data.num_participants),
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
