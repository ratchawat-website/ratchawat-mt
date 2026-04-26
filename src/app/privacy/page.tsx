import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Privacy Policy | Ratchawat Muay Thai Koh Samui",
  description:
    "Privacy policy for Chor Ratchawat Muay Thai Gym in Koh Samui. How we handle booking, contact, and payment data.",
  path: "/privacy",
  noIndex: true,
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={[organizationSchema()]} />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Privacy" }]}
      />

      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-on-surface">
            Privacy Policy
          </h1>
          <p className="mt-4 text-on-surface-variant text-base">
            Our full privacy policy is being finalised. This page will be
            updated before the site goes live. In the meantime, here is the
            short version.
          </p>

          <div className="mt-8 space-y-6 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                What we collect
              </h2>
              <p>
                When you book online or contact us we collect your name, email,
                phone number, and the booking details you give us. Payments go
                through Stripe and we never see or store your card data.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                How we use it
              </h2>
              <p>
                Booking and payment data is used to confirm your sessions, send
                receipts, and run the gym. Contact form submissions are used to
                reply to your message. We do not sell or share your data with
                third parties for marketing.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Who handles it
              </h2>
              <p>
                Our processors are Stripe (payments), Supabase (database and
                authentication), and Resend (transactional email). Each handles
                data under their own published policies.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Your rights
              </h2>
              <p>
                You can ask us to access, correct, or delete the data we hold
                about you. Send a request to{" "}
                <a
                  href="mailto:chor.ratchawat@gmail.com"
                  className="text-primary hover:text-primary-dim transition-colors font-medium"
                >
                  chor.ratchawat@gmail.com
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Contact
              </h2>
              <p>
                Chor Ratchawat Muay Thai Gym, Koh Samui, Thailand. Phone +66 63
                080 2876. See the{" "}
                <Link
                  href="/contact"
                  className="text-primary hover:text-primary-dim transition-colors font-medium"
                >
                  contact page
                </Link>{" "}
                for full details.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
