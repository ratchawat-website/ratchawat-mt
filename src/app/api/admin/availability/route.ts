import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { date, type, time_slot, reason } = await request.json();
  if (!date || !type)
    return NextResponse.json(
      { error: "date and type required" },
      { status: 400 },
    );

  const { data, error } = await supabase
    .from("availability_blocks")
    .insert({
      date,
      type,
      time_slot: time_slot ?? null,
      reason: reason ?? null,
      is_blocked: true,
    })
    .select("id")
    .single();

  if (error)
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
