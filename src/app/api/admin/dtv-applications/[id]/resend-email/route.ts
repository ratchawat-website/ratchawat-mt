import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendDtvApplicationReceivedEmail } from "@/lib/email/send";
import type { DtvApplicationEmailData } from "@/lib/email/templates/DTVApplicationReceived";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: app, error } = await supabase
    .from("dtv_applications")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const emailData: DtvApplicationEmailData = {
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
    await sendDtvApplicationReceivedEmail(emailData);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend DTV email failed:", err);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
