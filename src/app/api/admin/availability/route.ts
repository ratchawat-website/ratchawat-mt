import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AvailabilityBlockInsertSchema } from "@/lib/validation/availability";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = AvailabilityBlockInsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { date, type, time_slot, reason } = parsed.data;

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
