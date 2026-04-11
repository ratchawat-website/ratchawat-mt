import Link from "next/link";
import Stripe from "stripe";
import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPriceById } from "@/content/pricing";
import { CheckCircle, Mail, MapPin, Clock } from "lucide-react";

export const metadata = generatePageMeta({
  title: "Booking Confirmed | Ratchawat Muay Thai Koh Samui",
  description:
    "Your Muay Thai training at Ratchawat Koh Samui is booked. Check your email for confirmation details.",
  path: "/booking/confirmed",
  noIndex: true,
});

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

interface BookingSummary {
  id: string;
  packageName: string;
  startDate: string;
  endDate: string | null;
  timeSlot: string | null;
  camp: string | null;
  amount: number;
  clientName: string;
}

async function resolveBooking(
  sessionId: string,
): Promise<BookingSummary | null> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const bookingId = session.metadata?.booking_id;
    if (!bookingId) return null;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (error || !data) return null;

    const pkg = getPriceById(data.price_id);
    return {
      id: data.id,
      packageName: pkg?.name ?? data.price_id,
      startDate: data.start_date,
      endDate: data.end_date,
      timeSlot: data.time_slot,
      camp: data.camp,
      amount: data.price_amount,
      clientName: data.client_name,
    };
  } catch (err) {
    console.error("Failed to resolve booking:", err);
    return null;
  }
}

const CAMP_LABEL: Record<string, string> = {
  "bo-phut": "Bo Phut",
  "plai-laem": "Plai Laem",
  both: "Plai Laem stay, both camps for training",
};

export default async function BookingConfirmedPage({ searchParams }: Props) {
  const params = await searchParams;
  const booking = params.session_id
    ? await resolveBooking(params.session_id)
    : null;

  return (
    <>
      <JsonLd data={[organizationSchema()]} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Book", href: "/booking" },
          { label: "Confirmed" },
        ]}
      />

      <section className="py-16 sm:py-24 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle
            size={64}
            className="text-primary mx-auto mb-6"
            aria-hidden="true"
          />
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface uppercase">
            Booking Confirmed
          </h1>
          {booking ? (
            <p className="mt-4 text-on-surface-variant text-lg">
              Thanks {booking.clientName}. Your booking is locked in and your
              confirmation email is on its way.
            </p>
          ) : (
            <p className="mt-4 text-on-surface-variant text-lg">
              You are all set. Check your email for confirmation details.
            </p>
          )}
        </div>
      </section>

      {booking && (
        <section className="pb-12 px-6 sm:px-10 md:px-16 lg:px-20">
          <div className="max-w-2xl mx-auto">
            <GlassCard hover={false}>
              <h2 className="font-serif text-lg font-bold text-on-surface mb-4 uppercase">
                Your Booking
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-on-surface-variant">Package</span>
                  <span className="text-on-surface font-medium text-right">
                    {booking.packageName}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-on-surface-variant">Start date</span>
                  <span className="text-on-surface font-medium">
                    {booking.startDate}
                  </span>
                </div>
                {booking.endDate && (
                  <div className="flex justify-between gap-4">
                    <span className="text-on-surface-variant">End date</span>
                    <span className="text-on-surface font-medium">
                      {booking.endDate}
                    </span>
                  </div>
                )}
                {booking.timeSlot && (
                  <div className="flex justify-between gap-4">
                    <span className="text-on-surface-variant">Time</span>
                    <span className="text-on-surface font-medium">
                      {booking.timeSlot}
                    </span>
                  </div>
                )}
                {booking.camp && (
                  <div className="flex justify-between gap-4">
                    <span className="text-on-surface-variant">Location</span>
                    <span className="text-on-surface font-medium">
                      {CAMP_LABEL[booking.camp] ?? booking.camp}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-outline-variant">
                  <span className="text-on-surface font-semibold">
                    Total paid
                  </span>
                  <span className="font-serif text-xl font-bold text-primary">
                    {booking.amount.toLocaleString("en-US")} THB
                  </span>
                </div>
                <p className="text-on-surface-variant text-xs pt-2">
                  Booking ID: {booking.id}
                </p>
              </div>
            </GlassCard>
          </div>
        </section>
      )}

      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="font-serif text-xl font-bold text-on-surface mb-4">
            What Happens Next
          </h2>
          <GlassCard hover={false}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail
                  size={20}
                  className="text-primary shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-on-surface font-medium text-sm">
                    Check your email
                  </p>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    Your confirmation email has full details and directions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin
                  size={20}
                  className="text-primary shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-on-surface font-medium text-sm">
                    Find the gym
                  </p>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    <Link href="/camps/bo-phut" className="btn-link">
                      Bo Phut
                    </Link>
                    {" or "}
                    <Link href="/camps/plai-laem" className="btn-link">
                      Plai Laem
                    </Link>{" "}
                    - maps and directions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock
                  size={20}
                  className="text-primary shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-on-surface font-medium text-sm">
                    Arrive 10 minutes early
                  </p>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    Bring shorts and a t-shirt. Gloves and shin guards are
                    provided.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/programs" className="btn-primary text-center text-sm">
              Browse Programs
            </Link>
            <Link
              href="/"
              className="text-center text-sm text-on-surface-variant font-medium hover:text-on-surface transition-colors border-2 border-outline-variant rounded-lg px-6 py-3"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
