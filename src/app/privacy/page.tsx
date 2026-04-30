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
});

const LAST_UPDATED = "29 April 2026";

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={[organizationSchema()]} />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Privacy", href: "/privacy" }]}
      />

      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-on-surface">
            Privacy Policy
          </h1>
          <p className="mt-4 text-on-surface-variant text-base">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="mt-8 space-y-6 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Who we are
              </h2>
              <p>
                This site is operated by{" "}
                <strong className="text-on-surface">
                  CHOR:RATCHAWAT CO., LTD
                </strong>
                , a company registered in Thailand and trading as Chor
                Ratchawat Muay Thai Gym, a training camp based in Koh Samui,
                Surat Thani Province. When this policy refers to{" "}
                &quot;we&quot;, &quot;us&quot;, or &quot;the gym&quot;, it
                means CHOR:RATCHAWAT CO., LTD. You can reach us at{" "}
                <a
                  href="mailto:chor.ratchawat@gmail.com"
                  className="text-primary hover:text-primary-dim transition-colors font-medium"
                >
                  chor.ratchawat@gmail.com
                </a>{" "}
                or on WhatsApp at +66 63 080 2876.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                What we collect
              </h2>
              <p>
                When you book a session, fill in the contact form, or apply for
                a DTV visa package, we collect your name, email, phone number,
                and the session or accommodation details you give us. For DTV
                applications we also collect your nationality and passport
                number, which are needed for the enrollment letter.
              </p>
              <p className="mt-3">
                Payments are handled by Stripe. We never see, log, or store your
                card number. Stripe sends us a payment confirmation and the
                last four digits, nothing else.
              </p>
              <p className="mt-3">
                The site uses essential session cookies for login (Supabase
                Auth) and checkout (Stripe). We do not run third-party
                analytics, advertising trackers, or social pixels.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                How we use it
              </h2>
              <p>
                Booking and payment data is used to confirm your sessions, send
                receipts, and run the camp day to day. Contact form submissions
                are used to reply to your message. DTV application data is used
                to prepare your enrollment letter and the documentation
                required by the Thai e-visa portal. We do not sell or share your
                data with third parties for marketing.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Who handles it
              </h2>
              <p>
                We rely on a short list of processors, each handling data under
                their own published policies:
              </p>
              <ul className="mt-3 space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-on-surface">Stripe</strong> (payments
                  and refunds), based in Ireland and the United States.
                </li>
                <li>
                  <strong className="text-on-surface">Supabase</strong>{" "}
                  (database, authentication, file storage), hosted in
                  Singapore.
                </li>
                <li>
                  <strong className="text-on-surface">Resend</strong>{" "}
                  (transactional email for booking and DTV confirmations),
                  based in the United States.
                </li>
                <li>
                  <strong className="text-on-surface">Vercel</strong> (website
                  hosting and edge delivery).
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                How long we keep it
              </h2>
              <p>
                Booking and payment records are kept for two years after the
                session date, which is the retention period required by Thai
                tax and accounting rules. DTV application records are kept for
                two years after the visa is issued or refused. Contact form
                messages are deleted once the conversation is over, and within
                six months at the latest. Auth accounts are kept until you
                delete them or ask us to.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Your rights
              </h2>
              <p>
                You can ask us to access, correct, or delete the data we hold
                about you. If you booked from the EU or the UK, you also have
                the right to object to processing, request a copy in a portable
                format, or lodge a complaint with your local data protection
                authority. Send any request to{" "}
                <a
                  href="mailto:chor.ratchawat@gmail.com"
                  className="text-primary hover:text-primary-dim transition-colors font-medium"
                >
                  chor.ratchawat@gmail.com
                </a>{" "}
                and we will reply within 30 days.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                International transfers
              </h2>
              <p>
                Because our processors are based outside Thailand, your data
                may be transferred to and stored in Singapore, Ireland, or the
                United States. Each processor publishes its own safeguards
                (Standard Contractual Clauses for EU/UK transfers, ISO 27001,
                SOC 2). We rely on those safeguards rather than maintaining our
                own.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Changes to this policy
              </h2>
              <p>
                If we change how we handle data, we update this page and the
                &quot;Last updated&quot; date above. Material changes (new
                processors, new categories of data) are flagged at checkout or
                by email if we have your address.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Contact
              </h2>
              <p>
                CHOR:RATCHAWAT CO., LTD — 20, 33 Moo 5, Soi Plai Laem 13,
                Tambon Bo Put, Koh Samui, Surat Thani (สุราษฎร์ธานี) 84320,
                Thailand. Phone +66 63 080 2876. Full addresses for both
                training camps are on the{" "}
                <Link
                  href="/contact"
                  className="text-primary hover:text-primary-dim transition-colors font-medium"
                >
                  contact page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
