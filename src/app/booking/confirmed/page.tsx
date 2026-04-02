import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import { CheckCircle, Mail, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Booking Confirmed | Ratchawat Muay Thai Koh Samui",
  description:
    "Your Muay Thai training at Ratchawat Koh Samui is booked. Check your email for confirmation details.",
  path: "/booking/confirmed",
  noIndex: true,
});

export default function BookingConfirmedPage() {
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
          <CheckCircle size={64} className="text-primary mx-auto mb-6" />
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface uppercase">
            Booking Confirmed
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg">
            You are all set. Check your email for confirmation details and directions to the gym.
          </p>
        </div>
      </section>

      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            What Happens Next
          </h2>
          <GlassCard hover={false}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-on-surface font-medium text-sm">Check your email</p>
                  <p className="text-on-surface-variant text-sm">
                    You will receive a confirmation email with your booking details and a receipt.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-on-surface font-medium text-sm">Find the gym</p>
                  <p className="text-on-surface-variant text-sm">
                    Check the{" "}
                    <Link href="/camps/bo-phut" className="text-primary hover:text-primary-dim transition-colors">Bo Phut</Link>
                    {" "}or{" "}
                    <Link href="/camps/plai-laem" className="text-primary hover:text-primary-dim transition-colors">Plai Laem</Link>
                    {" "}page for directions and a map.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-on-surface font-medium text-sm">Show up 10 minutes early</p>
                  <p className="text-on-surface-variant text-sm">
                    Bring shorts and a t-shirt. Gloves and shin guards are available at the gym.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              href="/programs"
              className="text-center text-sm text-primary font-semibold hover:text-primary-dim transition-colors border-2 border-primary/30 rounded-lg px-6 py-3"
            >
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
