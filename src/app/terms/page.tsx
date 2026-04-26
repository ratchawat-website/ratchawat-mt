import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Terms of Service | Ratchawat Muay Thai Koh Samui",
  description:
    "Terms of service for Chor Ratchawat Muay Thai Gym in Koh Samui. Booking, payment, training, and accommodation conditions.",
  path: "/terms",
  noIndex: true,
});

export default function TermsPage() {
  return (
    <>
      <JsonLd data={[organizationSchema()]} />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Terms" }]}
      />

      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-on-surface">
            Terms of Service
          </h1>
          <p className="mt-4 text-on-surface-variant text-base">
            Our full terms of service are being finalised and will be published
            before the site goes live. In the meantime, here is what you need to
            know when you book or train with us.
          </p>

          <div className="mt-8 space-y-6 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Booking and payment
              </h2>
              <p>
                Online bookings are paid up front through Stripe. You receive an
                email confirmation right after payment. Group classes can also
                be paid on the day at the gym (drop-in 400 THB).
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Cancellations and changes
              </h2>
              <p>
                Need to reschedule or cancel? Message us on WhatsApp or email as
                soon as you know. For group classes, rescheduling is usually
                straightforward. Private lessons booked less than 12 hours ahead
                are handled directly through WhatsApp.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                DTV visa packages
              </h2>
              <p>
                The 6-month DTV training package fee covers your training and
                the official enrollment letter. The 10,000 THB embassy fee is
                paid separately on the Thai e-visa portal. If your visa is
                refused, no cash refund is issued, but we provide a training
                voucher of the same value to use at our camps.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Training risk
              </h2>
              <p>
                Muay Thai is a contact sport. Sparring is optional in group
                classes and required for the Fighter Program. You train at your
                own risk. Trainers adjust intensity to your level. If you have
                an injury or medical condition, tell the trainer before the
                session.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Accommodation
              </h2>
              <p>
                On-site rooms and the bungalow at our Plai Laem camp are
                reserved per the Camp Stay package booked. For special requests
                (extended dates, group bookings, bank transfer payments), see
                the{" "}
                <Link
                  href="/accommodation"
                  className="text-primary hover:text-primary-dim transition-colors font-medium"
                >
                  accommodation page
                </Link>{" "}
                and contact us on WhatsApp directly.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Contact
              </h2>
              <p>
                Questions on these terms? Reach out via the{" "}
                <Link
                  href="/contact"
                  className="text-primary hover:text-primary-dim transition-colors font-medium"
                >
                  contact page
                </Link>{" "}
                or WhatsApp at +66 63 080 2876.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
