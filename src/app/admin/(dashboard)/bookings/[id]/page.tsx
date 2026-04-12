import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail, Phone, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPriceById } from "@/content/pricing";
import StatusBadge from "@/components/admin/StatusBadge";
import TypeBadge from "@/components/admin/TypeBadge";
import BookingActions from "@/components/admin/BookingActions";
import BookingNotesEditor from "@/components/admin/BookingNotesEditor";
import { formatDateLong } from "@/lib/utils/date-format";

interface PageProps {
  params: Promise<{ id: string }>;
}

const CAMP_LABELS: Record<string, string> = {
  "bo-phut": "Bo Phut",
  "plai-laem": "Plai Laem",
  both: "Plai Laem stay, both camps",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return formatDateLong(dateStr);
}

function formatAmount(amount: number | null): string {
  if (amount == null) return "-";
  return `${amount.toLocaleString("en-US")} THB`;
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

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (!booking) notFound();

  const pkg = getPriceById(booking.price_id);
  const packageName = pkg?.name ?? booking.price_id;
  const shortId = booking.id.replace(/-/g, "").slice(0, 8).toUpperCase();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={15} />
          Back to Bookings
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-bold text-on-surface uppercase tracking-tight">
              Booking #{shortId}
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5 font-mono">{booking.id}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={booking.type} />
            <StatusBadge status={booking.status} />
            {booking.payment_intent_id && (
              <a
                href={stripePaymentUrl(booking.payment_intent_id)}
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

      {/* Client */}
      <section className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
          Client
        </p>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-on-surface">{booking.client_name}</p>
          <a
            href={`mailto:${booking.client_email}`}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Mail size={13} />
            {booking.client_email}
          </a>
          {booking.client_phone && (
            <div>
              <a
                href={`https://wa.me/${booking.client_phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                <Phone size={13} />
                {booking.client_phone}
              </a>
            </div>
          )}
          {booking.client_nationality && (
            <div className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant">
              <Globe size={13} />
              {booking.client_nationality}
            </div>
          )}
        </div>
      </section>

      {/* Booking Details */}
      <section className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
          Details
        </p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <dt className="text-xs text-on-surface-variant">Package</dt>
            <dd className="text-sm text-on-surface font-medium mt-0.5">{packageName}</dd>
          </div>
          {booking.camp && (
            <div>
              <dt className="text-xs text-on-surface-variant">Camp</dt>
              <dd className="text-sm text-on-surface font-medium mt-0.5">
                {CAMP_LABELS[booking.camp] ?? booking.camp}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-on-surface-variant">Start Date</dt>
            <dd className="text-sm text-on-surface font-medium mt-0.5">
              {formatDate(booking.start_date)}
            </dd>
          </div>
          {booking.end_date && (
            <div>
              <dt className="text-xs text-on-surface-variant">End Date</dt>
              <dd className="text-sm text-on-surface font-medium mt-0.5">
                {formatDate(booking.end_date)}
              </dd>
            </div>
          )}
          {booking.time_slot && (
            <div>
              <dt className="text-xs text-on-surface-variant">Time Slot</dt>
              <dd className="text-sm text-on-surface font-medium mt-0.5 capitalize">
                {booking.time_slot}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-on-surface-variant">Participants</dt>
            <dd className="text-sm text-on-surface font-medium mt-0.5">
              {booking.num_participants}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-on-surface-variant">Amount</dt>
            <dd className="text-sm text-on-surface font-semibold mt-0.5">
              {formatAmount(booking.price_amount)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Stripe */}
      <section className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
          Stripe
        </p>
        <dl className="space-y-2">
          {booking.stripe_session_id && (
            <div>
              <dt className="text-xs text-on-surface-variant">Session ID</dt>
              <dd className="text-xs text-on-surface font-mono mt-0.5 break-all">
                {booking.stripe_session_id}
              </dd>
            </div>
          )}
          {booking.payment_intent_id && (
            <div>
              <dt className="text-xs text-on-surface-variant">Payment Intent</dt>
              <dd className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-on-surface font-mono break-all">
                  {booking.payment_intent_id}
                </span>
                <a
                  href={stripePaymentUrl(booking.payment_intent_id)}
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
          {booking.payment_status && (
            <div>
              <dt className="text-xs text-on-surface-variant">Payment Status</dt>
              <dd className="text-sm text-on-surface font-medium mt-0.5 capitalize">
                {booking.payment_status}
              </dd>
            </div>
          )}
          {!booking.stripe_session_id && !booking.payment_intent_id && !booking.payment_status && (
            <p className="text-sm text-on-surface-variant italic">No Stripe data</p>
          )}
        </dl>
      </section>

      {/* Notes */}
      <section className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
        <BookingNotesEditor bookingId={booking.id} initialNotes={booking.notes} />
      </section>

      {/* Actions */}
      <section className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
        <BookingActions bookingId={booking.id} status={booking.status} />
      </section>
    </div>
  );
}
