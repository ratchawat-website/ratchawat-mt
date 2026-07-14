import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminBookingSchema } from "@/lib/validation/admin-booking";
import { getPriceById } from "@/content/pricing";
import { getInventoryKey } from "@/lib/admin/inventory";
import { checkRangeAvailability } from "@/lib/admin/availability";
import { addDays, format } from "date-fns";
import {
  hasSlotCapacity,
  isSlotClosed,
  getSlotOccupancy,
} from "@/lib/booking/capacity";
import {
  computeBookingAmount,
  getCapacityUnits,
  getParticipantBounds,
} from "@/lib/booking/pricing";

function computeEndDate(priceId: string, startDate: string): string | null {
  let days: number | null = null;
  if (priceId.includes("1week")) days = 7;
  else if (priceId.includes("2weeks")) days = 14;
  else if (priceId.includes("1month") || priceId.includes("monthly")) days = 30;
  else if (priceId.includes("bungalow")) days = 30;
  if (!days) return null;
  return format(addDays(new Date(startDate + "T00:00:00"), days), "yyyy-MM-dd");
}

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

  // Compute end_date from package duration if not provided
  const endDate =
    data.end_date || computeEndDate(data.price_id, data.start_date);

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
    await admin
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
  }

  return NextResponse.json({ ok: true, id: booking.id });
}
