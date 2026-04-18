import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPriceById } from "@/content/pricing";
import DtvStatusBadge from "@/components/admin/DtvStatusBadge";
import { formatDateShort } from "@/lib/utils/date-format";
import { ChevronRight, AlertTriangle } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "paid", label: "Paid · docs to send" },
  { value: "docs_sent", label: "Docs sent" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refused_voucher_issued", label: "Refused" },
];

const DOC_SLA_HOURS = 24;

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 36e5;
}

export default async function AdminDtvApplicationsPage({
  searchParams,
}: PageProps) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("dtv_applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data: applications } = await query;
  const list = applications ?? [];

  const pendingDocsCount = list.filter((a) => a.status === "paid").length;
  const total = list.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-bold text-on-surface uppercase tracking-tight">
            DTV Applications
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            {total === 0
              ? "No applications yet"
              : `${total} application${total === 1 ? "" : "s"}${
                  pendingDocsCount > 0
                    ? ` · ${pendingDocsCount} awaiting docs`
                    : ""
                }`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = (status ?? "") === f.value;
          const href = f.value
            ? `/admin/dtv-applications?status=${f.value}`
            : "/admin/dtv-applications";
          return (
            <Link
              key={f.value || "all"}
              href={href}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-widest border-2 transition-colors ${
                active
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-surface-lowest text-on-surface-variant border-outline-variant hover:text-on-surface hover:border-outline"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="bg-surface border-2 border-outline-variant rounded-xl p-8 text-center text-on-surface-variant text-sm">
          No applications match this filter.
        </div>
      ) : (
        <div className="bg-surface border-2 border-outline-variant rounded-xl overflow-hidden divide-y-2 divide-outline-variant">
          {list.map((a) => {
            const pkg = getPriceById(a.price_id);
            const packageName = pkg?.nameShort ?? a.price_id;
            const shortId = a.id.replace(/-/g, "").slice(0, 8).toUpperCase();
            const overdue =
              a.status === "paid" && hoursSince(a.created_at) > DOC_SLA_HOURS;

            return (
              <Link
                key={a.id}
                href={`/admin/dtv-applications/${a.id}`}
                className="flex items-center gap-4 px-4 sm:px-5 py-3.5 hover:bg-surface-lowest/70 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm text-on-surface truncate">
                      {a.first_name} {a.last_name}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      #{shortId}
                    </span>
                    <DtvStatusBadge status={a.status} />
                    {overdue && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/30">
                        <AlertTriangle size={10} />
                        24h SLA
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant truncate">
                    {packageName} ·{" "}
                    {a.price_amount.toLocaleString("en-US")} THB ·{" "}
                    {a.nationality} · arrival{" "}
                    {formatDateShort(a.arrival_date)}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-on-surface-variant shrink-0"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
