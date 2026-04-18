import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["cancelled"],
  paid: ["docs_sent", "cancelled", "refused_voucher_issued"],
  docs_sent: ["cancelled", "refused_voucher_issued"],
};

const TERMINAL = new Set(["cancelled", "refused_voucher_issued"]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await request.json();
  const { data: app } = await supabase
    .from("dtv_applications")
    .select("status")
    .eq("id", id)
    .single();
  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  if (TERMINAL.has(app.status)) {
    return NextResponse.json(
      { error: `Application is already ${app.status}` },
      { status: 400 },
    );
  }

  const allowed = VALID_TRANSITIONS[app.status] ?? [];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `Cannot transition from ${app.status} to ${status}` },
      { status: 400 },
    );
  }

  const update: { status: string; docs_sent_at?: string } = { status };
  if (status === "docs_sent") {
    update.docs_sent_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("dtv_applications")
    .update(update)
    .eq("id", id);
  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  return NextResponse.json({ ok: true, status });
}
