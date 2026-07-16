import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { BookingRequestSchema } from "@/lib/validation/booking";
import { getPriceById, getStripePriceId } from "@/content/pricing";
import { getInventoryKey } from "@/lib/admin/inventory";
import { checkRangeAvailability, findOverbookedNight } from "@/lib/admin/availability";
import { getCheckoutOrigin } from "@/lib/utils/origin";
import { formatDateLong } from "@/lib/utils/date-format";
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

    // Private bookings take a dedicated multi-session path: N bookings rows
    // linked by booking_group_id, one Stripe payment for the whole cart.
    // Lead time (12h before 09:30, 2h otherwise) and per-camp trainer
    // capacity are enforced per session.
    if (data.type === "private") {
      const sessions = data.sessions!; // superRefine guarantees >= 1
      const isPack = pkg.id === "private-adult-10pack";
      if (isPack && sessions.length !== 1) {
        return NextResponse.json(
          { error: "The 10-session pack books exactly one first session online." },
          { status: 400 },
        );
      }
      if (data.camp === "both") {
        return NextResponse.json(
          { error: "Private sessions need a specific camp." },
          { status: 400 },
        );
      }
      const camp = data.camp;
      const units = getCapacityUnits(pkg, data.num_participants);
      const supabase = createAdminClient();

      // Validate every session before writing anything.
      try {
        for (const s of sessions) {
          if (isSlotWithinCutoff(s.date, s.time_slot)) {
            const cutoff = getCutoffHoursForSlot(s.time_slot);
            return NextResponse.json(
              {
                error: `${formatDateLong(s.date)} at ${s.time_slot} needs at least ${cutoff}h notice. Please adjust your cart or contact us on WhatsApp.`,
              },
              { status: 400 },
            );
          }
          if (await isSlotClosed(supabase, s.date, s.time_slot)) {
            return NextResponse.json(
              {
                error: `${formatDateLong(s.date)} at ${s.time_slot} is closed. Please pick another time.`,
              },
              { status: 409 },
            );
          }
          const occupied = await getSlotOccupancy(supabase, {
            date: s.date,
            timeSlot: s.time_slot,
            camp,
          });
          if (!hasSlotCapacity(occupied, units)) {
            return NextResponse.json(
              {
                error: `${formatDateLong(s.date)} at ${s.time_slot} is fully booked at the selected camp. Please pick another time or camp.`,
              },
              { status: 409 },
            );
          }
        }
      } catch (checkErr) {
        console.error("Slot availability check failed:", checkErr);
        return NextResponse.json(
          { error: "Could not verify slot availability. Please try again." },
          { status: 500 },
        );
      }

      const perSessionAmount = computeBookingAmount(pkg, data.num_participants);
      const groupId = crypto.randomUUID();
      const insertedBookingIds: string[] = [];

      // Rollback helper: remove everything this request created.
      const rollback = async () => {
        if (insertedBookingIds.length === 0) return;
        await supabase
          .from("availability_blocks")
          .delete()
          .in(
            "reason",
            insertedBookingIds.map((id) => `Booking ${id}`),
          );
        await supabase.from("bookings").delete().in("id", insertedBookingIds);
      };

      for (const s of sessions) {
        const { data: booking, error } = await supabase
          .from("bookings")
          .insert({
            type: "private",
            status: "pending",
            price_id: data.price_id,
            price_amount: perSessionAmount,
            num_participants: data.num_participants,
            start_date: s.date,
            end_date: null,
            time_slot: s.time_slot,
            camp,
            booking_group_id: groupId,
            client_name: data.client_name,
            client_email: data.client_email,
            client_phone: data.client_phone,
            client_nationality: data.client_nationality ?? null,
            notes: data.notes ?? null,
          })
          .select("id")
          .single();
        if (error || !booking) {
          console.error("Booking insert failed:", error);
          await rollback();
          return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 },
          );
        }
        insertedBookingIds.push(booking.id);

        const { error: blockErr } = await supabase
          .from("availability_blocks")
          .insert({
            date: s.date,
            type: "private-slot",
            time_slot: s.time_slot,
            camp,
            units,
            is_blocked: true,
            reason: `Booking ${booking.id}`,
          });
        if (blockErr) {
          console.error("Slot block insert failed:", blockErr);
          await rollback();
          return NextResponse.json(
            { error: "Could not reserve the slot. Please try again." },
            { status: 500 },
          );
        }

        // Insert-then-verify per session (closes the concurrent race).
        const occupiedAfter = await getSlotOccupancy(supabase, {
          date: s.date,
          timeSlot: s.time_slot,
          camp,
        });
        if (occupiedAfter > PRIVATE_SLOT_CAPACITY) {
          await rollback();
          return NextResponse.json(
            {
              error: `${formatDateLong(s.date)} at ${s.time_slot} just filled up. Please pick another time.`,
            },
            { status: 409 },
          );
        }
      }

      const origin = getCheckoutOrigin(request);
      const stripe = getStripe();
      let session: Stripe.Checkout.Session;
      try {
        session = await stripe.checkout.sessions.create({
          mode: "payment",
          locale: "en",
          payment_method_types: ["card"],
          line_items: [
            {
              price: stripePriceId,
              quantity:
                getStripeQuantity(pkg, data.num_participants) *
                sessions.length,
            },
          ],
          metadata: {
            booking_id: insertedBookingIds[0],
            booking_group_id: groupId,
          },
          customer_email: data.client_email,
          success_url: `${origin}/booking/confirmed?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/booking?cancelled=1`,
        });
      } catch (stripeErr) {
        console.error("Stripe session creation failed:", stripeErr);
        await rollback();
        return NextResponse.json(
          { error: "Payment provider error. Please try again." },
          { status: 500 },
        );
      }

      return NextResponse.json({ url: session.url });
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

    // Insert-then-verify for accommodation-consuming packages (same race
    // closure as the private-slot path above).
    if (inventoryKey && data.start_date && data.end_date) {
      const overbooked = await findOverbookedNight(
        inventoryKey,
        data.start_date,
        data.end_date,
      );
      if (overbooked) {
        await supabase.from("bookings").delete().eq("id", booking.id);
        return NextResponse.json(
          {
            error: `Sold out on ${overbooked}. Please choose different dates.`,
          },
          { status: 409 },
        );
      }
    }

    const origin = getCheckoutOrigin(request);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "en",
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
