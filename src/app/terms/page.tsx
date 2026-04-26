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

const LAST_UPDATED = "26 April 2026";

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
            Last updated: {LAST_UPDATED}
          </p>

          <div className="mt-8 space-y-6 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Who you are booking with
              </h2>
              <p>
                When you book a session, an accommodation package, or a DTV
                application on this site, you enter into an agreement with Chor
                Ratchawat Muay Thai Gym, a family-run training camp based in
                Koh Samui, Surat Thani Province, Thailand. By completing a
                booking you confirm that you are at least 18 years old (or
                booking on behalf of a child you are responsible for) and that
                you accept these terms.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Booking and payment
              </h2>
              <p>
                Online bookings are paid up front through Stripe in Thai Baht.
                You receive an email confirmation as soon as the payment goes
                through. Group classes can also be paid on the day at the gym
                at the standard 400 THB drop-in rate. Private sessions, fighter
                programs, accommodation, and DTV packages are booked online or
                directly with us on WhatsApp.
              </p>
              <p className="mt-3">
                Prices on the site include all applicable Thai taxes. Bank
                transfer (domestic Thai or international wire via Wise) is
                possible for accommodation and longer stays, on request.
                Contact us on WhatsApp before paying that way.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Cancellations and changes
              </h2>
              <p>
                Plans change, we get it. The rules below cover the standard
                cases. For anything else, message us and we will work it out.
              </p>
              <ul className="mt-3 space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-on-surface">Group classes:</strong>{" "}
                  full refund or free reschedule if you cancel at least 24
                  hours before the session. Inside 24 hours, the session is
                  forfeited.
                </li>
                <li>
                  <strong className="text-on-surface">Private sessions:</strong>{" "}
                  full refund or reschedule if you cancel at least 12 hours
                  before a 7:00 or 8:00 slot, or at least 2 hours before any
                  other slot. Late cancellations are forfeited.
                </li>
                <li>
                  <strong className="text-on-surface">
                    Multi-week packs and unlimited passes:
                  </strong>{" "}
                  refundable on a pro-rated basis if you cancel before the pass
                  starts. Once started, unused sessions can be paused for up to
                  30 days for medical reasons (with a doctor&apos;s note).
                </li>
                <li>
                  <strong className="text-on-surface">
                    Fighter Program (monthly):
                  </strong>{" "}
                  refundable up to 7 days before the start date. After it
                  starts, the month is non-refundable, but we will do our best
                  to accommodate genuine emergencies.
                </li>
                <li>
                  <strong className="text-on-surface">Accommodation:</strong>{" "}
                  free cancellation up to 14 days before check-in. Inside 14
                  days, the first night is charged. Inside 48 hours, the full
                  stay is charged. No-shows are non-refundable.
                </li>
              </ul>
              <p className="mt-3">
                To cancel or reschedule, message us on WhatsApp at +66 63 080
                2876 or email{" "}
                <a
                  href="mailto:chor.ratchawat@gmail.com"
                  className="text-primary hover:text-primary-dim transition-colors font-medium"
                >
                  chor.ratchawat@gmail.com
                </a>
                . The timestamp of your message is what counts.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                DTV visa packages
              </h2>
              <p>
                The 6-month DTV training package fee covers your training and
                the official enrollment letter prepared by the gym. The 10,000
                THB embassy fee is paid separately on the Thai e-visa portal
                (thaievisa.go.th) and is set by the Thai government, not by us.
              </p>
              <p className="mt-3">
                If your visa application is refused by the embassy, no cash
                refund is issued. Instead, we issue a training voucher of the
                same value as the package fee, valid for 12 months at either
                of our camps. The voucher covers training and accommodation
                (not the embassy fee). It is non-transferable and cannot be
                exchanged for cash.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Training risk and your responsibility
              </h2>
              <p>
                Muay Thai is a contact sport. Sparring is optional in group
                classes and required for the Fighter Program. You train at your
                own risk. Trainers adjust intensity to your level, but bruises,
                soreness, and the occasional minor injury are part of the
                sport.
              </p>
              <p className="mt-3">
                Before your first session, tell the trainer about any injury,
                medical condition, pregnancy, or medication that could affect
                training. We strongly recommend travel and sports insurance
                that covers contact sports. We are not liable for injuries
                resulting from undisclosed medical conditions, ignored trainer
                instructions, or training under the influence of alcohol or
                drugs.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Accommodation
              </h2>
              <p>
                On-site rooms and the bungalow at our Plai Laem camp are
                reserved per the Camp Stay package booked. Standard check-in
                is from 14:00 and check-out by 11:00. Earlier or later times
                are usually fine if we know in advance.
              </p>
              <p className="mt-3">
                Rooms include water and Wi-Fi. The bungalow is metered for
                electricity, billed at 8 THB per unit on departure (typical
                Thai rate). Smoking is not allowed inside any room or the
                bungalow. Pets are not allowed. Damage caused beyond normal
                wear is invoiced at cost.
              </p>
              <p className="mt-3">
                For special requests (extended stays, group bookings, bank
                transfer payments), see the{" "}
                <Link
                  href="/accommodation"
                  className="text-primary hover:text-primary-dim transition-colors font-medium"
                >
                  accommodation page
                </Link>{" "}
                or contact us on WhatsApp directly.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Conduct at the camp
              </h2>
              <p>
                Respect is non-negotiable, both inside the ring and outside.
                Listen to the trainers, share equipment, leave your gear where
                you found it. We reserve the right to refuse training or
                accommodation to anyone whose behaviour puts other students,
                trainers, or the camp at risk, including violence outside the
                ring, harassment, theft, or repeated disruption. In those
                cases, no refund is issued.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Photos and videos
              </h2>
              <p>
                We sometimes film and photograph training sessions and fights
                for our Instagram, Facebook, and website. If you do not want to
                appear in any of those, tell the trainer at the start of the
                session and we will keep you out of frame. We do not publish
                children&apos;s names or full faces without parental consent.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Liability
              </h2>
              <p>
                Our total liability for any claim arising from training,
                accommodation, or services booked through this site is limited
                to the amount you paid for that specific booking. Nothing in
                these terms limits liability for death or personal injury
                caused by gross negligence on our part, or for any other
                liability that cannot be excluded under Thai law.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Governing law
              </h2>
              <p>
                These terms are governed by the laws of the Kingdom of
                Thailand. Any dispute that cannot be resolved between us
                directly is subject to the jurisdiction of the courts of Surat
                Thani Province. If you booked from the EU or the UK, this does
                not affect any mandatory consumer rights you have under your
                local law.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Changes to these terms
              </h2>
              <p>
                We can update these terms when we change how the camp operates
                or when the law requires it. The version that applies to your
                booking is the one published on the day you booked, kept on
                file in our booking records.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Contact
              </h2>
              <p>
                Questions about these terms? Reach out via the{" "}
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
