import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminBookingSchema } from "@/lib/validation/admin-booking";
import { getPriceById } from "@/content/pricing";
import { stayPriceId } from "@/content/stay-pricing";
import { computeStayPrice, StayPricingError } from "@/lib/booking/stay";
import { getInventoryKey, getStayUnitInventoryKey } from "@/lib/admin/inventory";
import { checkRangeAvailability } from "@/lib/admin/availability";
import {
  hasSlotCapacity,
  isSlotClosed,
  getSlotOccupancy,
} from "@/lib/booking/capacity";
import { PRIVATE_SLOT_CAPACITY } from "@/content/schedule";
import {
  computeBookingAmount,
  getCapacityUnits,
  getParticipantBounds,
} from "@/lib/booking/pricing";

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = AdminBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Stay bookings: tiered price computed from dates, no catalog package.
  const isStay = data.price_id.startsWith("stay-");
  if (isStay) {
    if (!data.stay_unit || !data.stay_plan || !data.end_date) {
      return NextResponse.json(
        { error: "Stay bookings need unit, plan, and end date." },
        { status: 400 },
      );
    }
    let quote;
    try {
      quote = computeStayPrice(
        data.start_date,
        data.end_date,
        data.stay_unit,
        data.stay_plan,
      );
    } catch (err) {
      if (err instanceof StayPricingError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }
    const stayInventoryKey = getStayUnitInventoryKey(data.stay_unit);
    const check = await checkRangeAvailability(
      stayInventoryKey,
      data.start_date,
      data.end_date,
    );
    if (!check.ok) {
      return NextResponse.json(
        {
          error: `No availability on ${check.conflictDate}. Choose different dates.`,
        },
        { status: 409 },
      );
    }
    const adminClient = createAdminClient();
    const { data: stayBooking, error: stayError } = await adminClient
      .from("bookings")
      .insert({
        type: data.stay_plan === "fighter" ? "fighter" : "camp-stay",
        status: "confirmed",
        price_id: stayPriceId(data.stay_unit, data.stay_plan),
        price_amount: data.price_amount ?? quote.total,
        num_participants: data.num_participants,
        start_date: data.start_date,
        end_date: data.end_date,
        time_slot: null,
        camp: data.stay_plan === "fighter" ? "plai-laem" : "both",
        client_name: data.client_name,
        client_email: data.client_email || "",
        client_phone: data.client_phone || "",
        client_nationality: data.client_nationality || null,
        notes: data.notes || null,
      })
      .select("id")
      .single();
    if (stayError || !stayBooking) {
      console.error("Admin stay booking insert error:", stayError);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, id: stayBooking.id });
  }

  const pkg = getPriceById(data.price_id);
  if (!pkg) {
    return NextResponse.json({ error: "Unknown price_id" }, { status: 400 });
  }

  const participantBounds = getParticipantBounds(pkg);
  if (
    data.num_participants < participantBounds.min ||
    data.num_participants > participantBounds.max
  ) {
    return NextResponse.json(
      {
        error: `This package accepts ${participantBounds.min} to ${participantBounds.max} participant(s).`,
      },
      { status: 400 },
    );
  }

  // Calculate amount: admin override > shared catalog computation
  const priceAmount =
    data.price_amount ?? computeBookingAmount(pkg, data.num_participants);

  // Non-stay types: end_date comes from the form (or stays null).
  const endDate = data.end_date || null;

  // Capacity check for accommodation types
  const inventoryKey = getInventoryKey(data.price_id);
  if (inventoryKey && endDate) {
    const check = await checkRangeAvailability(
      inventoryKey,
      data.start_date,
      endDate,
    );
    if (!check.ok) {
      return NextResponse.json(
        {
          error: `No availability on ${check.conflictDate}. Choose different dates.`,
        },
        { status: 409 },
      );
    }
  }

  // Mirror of the public checkout rule: a private session must target one
  // camp. "both" would skip the capacity check below AND create a block
  // that no per-camp occupancy query ever counts (silent overbooking).
  if (data.type === "private" && data.camp === "both") {
    return NextResponse.json(
      { error: "Private sessions need a specific camp." },
      { status: 400 },
    );
  }

  // Check private slot availability: same rules as the public checkout
  // (hard closure + per-camp trainer capacity), NOT "one booking blocks all".
  const admin = createAdminClient();
  const units = getCapacityUnits(pkg, data.num_participants);
  if (data.type === "private" && data.time_slot && data.camp !== "both") {
    try {
      if (await isSlotClosed(admin, data.start_date, data.time_slot)) {
        return NextResponse.json(
          {
            error: `Time slot ${data.time_slot} is closed on ${data.start_date}.`,
          },
          { status: 409 },
        );
      }
      const occupied = await getSlotOccupancy(admin, {
        date: data.start_date,
        timeSlot: data.time_slot,
        camp: data.camp,
      });
      if (!hasSlotCapacity(occupied, units)) {
        return NextResponse.json(
          {
            error: `Time slot ${data.time_slot} is fully booked at ${data.camp} on ${data.start_date} (${occupied}/6).`,
          },
          { status: 409 },
        );
      }
    } catch (checkErr) {
      console.error("Admin slot availability check failed:", checkErr);
      return NextResponse.json(
        { error: "Could not verify slot availability. Please try again." },
        { status: 500 },
      );
    }
  }

  // Insert booking
  const { data: booking, error } = await admin
    .from("bookings")
    .insert({
      type: data.type,
      status: "confirmed",
      price_id: data.price_id,
      price_amount: priceAmount,
      num_participants: data.num_participants,
      start_date: data.start_date,
      end_date: endDate ?? null,
      time_slot: data.time_slot ?? null,
      camp: data.camp,
      client_name: data.client_name,
      client_email: data.client_email || "",
      client_phone: data.client_phone || "",
      client_nationality: data.client_nationality || null,
      notes: data.notes || null,
    })
    .select("id")
    .single();

  if (error || !booking) {
    console.error("Admin booking insert error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }

  // Create private-slot block if private session
  if (data.type === "private" && data.time_slot) {
    const { error: blockErr } = await admin
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
      console.error("Admin slot block insert failed:", blockErr);
      await admin.from("bookings").delete().eq("id", booking.id);
      return NextResponse.json(
        { error: "Could not reserve the slot. Please try again." },
        { status: 500 },
      );
    }

    // Insert-then-verify, same as the public checkout: a concurrent
    // customer booking can land between our check and our insert.
    if (data.camp !== "both") {
      const occupiedAfter = await getSlotOccupancy(admin, {
        date: data.start_date,
        timeSlot: data.time_slot,
        camp: data.camp,
      });
      if (occupiedAfter > PRIVATE_SLOT_CAPACITY) {
        await admin
          .from("availability_blocks")
          .delete()
          .eq("reason", `Booking ${booking.id}`);
        await admin.from("bookings").delete().eq("id", booking.id);
        return NextResponse.json(
          {
            error: `Time slot ${data.time_slot} just filled up on ${data.start_date}. Pick another time.`,
          },
          { status: 409 },
        );
      }
    }
  }

  return NextResponse.json({ ok: true, id: booking.id });
}
