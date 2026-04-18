import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  FileText,
  Plane,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPriceById } from "@/content/pricing";
import DtvStatusBadge from "@/components/admin/DtvStatusBadge";
import DtvActions from "@/components/admin/DtvActions";
import DtvNotesEditor from "@/components/admin/DtvNotesEditor";
import { formatDateLong } from "@/lib/utils/date-format";

interface PageProps {
  params: Promise<{ id: string }>;
}

function isLiveStripe(): boolean {
  return process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ?? false;
}

function stripePaymentUrl(paymentIntentId: string): string {
  const base = isLiveStripe()
    ? "https://dashboard.stripe.com/payments"
    : "https://dashboard.stripe.com/test/payments";
  return `${base}/${paymentIntentId}`;
}

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 36e5;
}

const DOC_SLA_HOURS = 24;

export default async function DtvApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: app } = await supabase
    .from("dtv_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (!app) notFound();

  const pkg = getPriceById(app.price_id);
  const packageName = pkg?.name ?? app.price_id;
  const shortId = app.id.replace(/-/g, "").slice(0, 8).toUpperCase();
  const waPhone = app.phone.replace(/\D/g, "");
  const overdue =
    app.status === "paid" && hoursSince(app.created_at) > DOC_SLA_HOURS;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/admin/dtv-applications"
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={15} />
          Back to DTV applications
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-bold text-on-surface uppercase tracking-tight">
              DTV #{shortId}
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5 font-mono">
              {app.id}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <DtvStatusBadge status={app.status} />
            {app.stripe_payment_intent_id && (
              <a
                href={stripePaymentUrl(app.stripe_payment_intent_id)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-widest border-2 border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
              >
                <ExternalLink size={11} />
                Stripe
              </a>
            )}
          </div>
        </div>
      </div>

      {overdue && (
        <div className="flex items-start gap-3 rounded-lg border-2 border-red-500/30 bg-red-500/5 p-4 text-sm">
          <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-on-surface mb-1">
              24h documents SLA exceeded
            </p>
            <p className="text-on-surface-variant text-xs">
              This application was paid more than 24 hours ago. Send the
              enrollment letter and mark it as docs sent.
            </p>
          </div>
        </div>
      )}

      {/* Client */}
      <section className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
          Client
        </p>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-on-surface">
            {app.first_name} {app.last_name}
          </p>
          <a
            href={`mailto:${app.email}`}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Mail size={13} />
            {app.email}
          </a>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a
              href={`tel:${app.phone}`}
              className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              <Phone size={13} />
              {app.phone}
            </a>
            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              WhatsApp
            </a>
          </div>
          <div className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant">
            <Globe size={13} />
            {app.nationality}
          </div>
        </div>
      </section>

      {/* Package */}
      <section className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
          Package
        </p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <dt className="text-xs text-on-surface-variant">Package</dt>
            <dd className="text-sm text-on-surface font-medium mt-0.5">
              {packageName}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-on-surface-variant">Amount paid</dt>
            <dd className="text-sm text-on-surface font-semibold mt-0.5">
              {app.price_amount.toLocaleString("en-US")} THB
            </dd>
          </div>
        </dl>
      </section>

      {/* Passport */}
      <section className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-1.5">
          <FileText size={12} />
          Passport
        </p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <dt className="text-xs text-on-surface-variant">Number</dt>
            <dd className="text-sm text-on-surface font-mono font-medium mt-0.5">
              {app.passport_number}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-on-surface-variant">Expires</dt>
            <dd className="text-sm text-on-surface font-medium mt-0.5">
              {formatDateLong(app.passport_expiry)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Travel */}
      <section className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-1.5">
          <Plane size={12} />
          Travel
        </p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <dt className="text-xs text-on-surface-variant">
              Currently in Thailand
            </dt>
            <dd className="text-sm text-on-surface font-medium mt-0.5">
              {app.currently_in_thailand ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-on-surface-variant">Arrival</dt>
            <dd className="text-sm text-on-surface font-medium mt-0.5">
              {formatDateLong(app.arrival_date)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-on-surface-variant">Training start</dt>
            <dd className="text-sm text-on-surface font-medium mt-0.5">
              {formatDateLong(app.training_start_date)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Timeline */}
      <section className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-1.5">
          <Calendar size={12} />
          Timeline
        </p>
        <dl className="space-y-2">
          <div className="flex justify-between gap-4">
            <dt className="text-xs text-on-surface-variant">Submitted</dt>
            <dd className="text-sm text-on-surface font-medium">
              {new Date(app.created_at).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </dd>
          </div>
          {app.docs_sent_at && (
            <div className="flex justify-between gap-4">
              <dt className="text-xs text-on-surface-variant">Docs sent</dt>
              <dd className="text-sm text-on-surface font-medium">
                {new Date(app.docs_sent_at).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Stripe */}
      <section className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
          Stripe
        </p>
        <dl className="space-y-2">
          {app.stripe_session_id && (
            <div>
              <dt className="text-xs text-on-surface-variant">Session ID</dt>
              <dd className="text-xs text-on-surface font-mono mt-0.5 break-all">
                {app.stripe_session_id}
              </dd>
            </div>
          )}
          {app.stripe_payment_intent_id && (
            <div>
              <dt className="text-xs text-on-surface-variant">
                Payment Intent
              </dt>
              <dd className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-on-surface font-mono break-all">
                  {app.stripe_payment_intent_id}
                </span>
                <a
                  href={stripePaymentUrl(app.stripe_payment_intent_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-on-surface-variant hover:text-primary transition-colors"
                  aria-label="View in Stripe Dashboard"
                >
                  <ExternalLink size={13} />
                </a>
              </dd>
            </div>
          )}
          {app.stripe_payment_status && (
            <div>
              <dt className="text-xs text-on-surface-variant">
                Payment status
              </dt>
              <dd className="text-sm text-on-surface font-medium mt-0.5 capitalize">
                {app.stripe_payment_status}
              </dd>
            </div>
          )}
          {!app.stripe_session_id &&
            !app.stripe_payment_intent_id &&
            !app.stripe_payment_status && (
              <p className="text-sm text-on-surface-variant italic">
                No Stripe data
              </p>
            )}
        </dl>
      </section>

      {/* Notes */}
      <section className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
        <DtvNotesEditor
          applicationId={app.id}
          initialNotes={app.admin_notes}
        />
      </section>

      {/* Actions */}
      <section className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
        <DtvActions applicationId={app.id} status={app.status} />
      </section>
    </div>
  );
}
