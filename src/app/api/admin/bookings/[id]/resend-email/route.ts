import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendBookingConfirmationEmail } from "@/lib/email/send";
import type { BookingEmailData } from "@/lib/email/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const emailData: BookingEmailData = {
    id: booking.id,
    type: booking.type,
    price_id: booking.price_id,
    price_amount: booking.price_amount,
    start_date: booking.start_date,
    end_date: booking.end_date,
    time_slot: booking.time_slot,
    camp: booking.camp,
    num_participants: booking.num_participants,
    client_name: booking.client_name,
    client_email: booking.client_email,
    client_phone: booking.client_phone,
    client_nationality: booking.client_nationality,
    notes: booking.notes,
  };

  try {
    await sendBookingConfirmationEmail(emailData);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend email failed:", err);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
