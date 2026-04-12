import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await request.json();
  const { data: booking } = await supabase
    .from("bookings")
    .select("status")
    .eq("id", id)
    .single();
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const allowed = VALID_TRANSITIONS[booking.status] ?? [];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `Cannot transition from ${booking.status} to ${status}` },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  // On cancellation, remove the corresponding private-slot availability block
  if (status === "cancelled") {
    const adminSupabase = createAdminClient();
    const { data: cancelledBooking } = await adminSupabase
      .from("bookings")
      .select("type, start_date, time_slot")
      .eq("id", id)
      .single();

    if (cancelledBooking?.type === "private" && cancelledBooking.time_slot) {
      await adminSupabase
        .from("availability_blocks")
        .delete()
        .eq("date", cancelledBooking.start_date)
        .eq("type", "private-slot")
        .eq("time_slot", cancelledBooking.time_slot)
        .eq("reason", `Booking ${id}`);
    }
  }

  return NextResponse.json({ ok: true, status });
}
