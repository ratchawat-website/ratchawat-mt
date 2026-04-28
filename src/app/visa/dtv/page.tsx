import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import FAQAccordion from "@/components/ui/FAQAccordion";
import CTABanner from "@/components/ui/CTABanner";
import JsonLd from "@/components/seo/JsonLd";
import {
  organizationSchema,
  faqPageSchema,
  articleSchema,
} from "@/components/seo/SchemaOrg";
import {
  FileText,
  Clock,
  CheckCircle,
  Globe,
  CreditCard,
  Banknote,
  Mail,
  Calendar,
  Send,
  Check,
  Home,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { getPricesByCategory } from "@/content/pricing";

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-4">
      <span className="w-8 h-[2px] bg-primary" />
      <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">{label}</span>
      <span className="w-8 h-[2px] bg-primary" />
    </div>
  );
}

export const metadata = generatePageMeta({
  title: "DTV Visa for Muay Thai Thailand 2026 | Apply with Ratchawat",
  description:
    "Apply for the Destination Thailand Visa (DTV) with Chor Ratchawat. 6-month training packages from 20,000 THB. Official enrollment letter within 24h.",
  path: "/visa/dtv",
});

const DTV_PACKAGES = getPricesByCategory("dtv");

const requirements = [
  {
    icon: Globe,
    title: "Valid Passport",
    description: "At least 6 months validity remaining. Check expiry before you apply.",
  },
  {
    icon: Banknote,
    title: "500,000 THB Bank Statement",
    description: "Proof of funds in your bank account. Required by Thai embassies for the DTV.",
  },
  {
    icon: CreditCard,
    title: "10,000 THB Embassy Fee",
    description: "Paid directly to the Thai embassy or consulate where you apply.",
  },
  {
    icon: FileText,
    title: "Training Enrollment Letter",
    description: "We send this within 24h after you book. Confirms your Muay Thai enrollment.",
  },
];

const benefits = [
  "Up to 180 days per entry",
  "5-year visa with multiple entries",
  "Extendable at Thai immigration",
  "Train Muay Thai legally in Thailand",
  "Recognized Soft Power activity",
  "Applies to cultural and sports visitors",
];

const steps = [
  {
    icon: CheckCircle,
    step: "1",
    title: "Apply online",
    description: "Fill the form with your details, passport, and travel dates. Takes 5 minutes.",
  },
  {
    icon: CreditCard,
    step: "2",
    title: "Pay your package",
    description: "Stripe secure checkout. Pick the 6-month package that fits your pace.",
  },
  {
    icon: Mail,
    step: "3",
    title: "Receive your docs in 24h",
    description: "We email the official enrollment letter and supporting documents within 24 hours.",
  },
  {
    icon: Send,
    step: "4",
    title: "Submit your DTV application online",
    description:
      "File your DTV application on the official Thai e-visa portal at thaievisa.go.th. Upload the documents we sent you. The embassy charges a 10,000 THB fee, paid on the portal.",
  },
  {
    icon: Calendar,
    step: "5",
    title: "Fly to Koh Samui and train",
    description: "Once approved, land in Samui and start training. 180 days start on entry.",
  },
];

const faqs = [
  {
    question: "What is the DTV visa?",
    answer:
      "The Destination Thailand Visa (DTV) is a long-stay visa introduced under Thailand's Soft Power initiative. It lets people come to train or study specific activities, including Muay Thai, for up to 180 days per entry. The visa is valid for 5 years with multiple entries.",
  },
  {
    question: "How long does it take to get the training letter?",
    answer:
      "We email your enrollment letter and supporting documents within 24 hours of payment. That is the document the Thai embassy needs from us.",
  },
  {
    question: "What happens if my visa is refused?",
    answer:
      "No refund, but we offer a training voucher of the same value so you can train with us if you come to Thailand another way. This is covered in our terms before you pay.",
  },
  {
    question: "Do I need 500,000 THB in cash?",
    answer:
      "No. It needs to be on a bank statement showing the funds are available. You do not need to transfer the money or keep it frozen.",
  },
  {
    question: "Can I work on a DTV?",
    answer:
      "No. The DTV is for training and cultural activities. A work permit is required to work in Thailand.",
  },
  {
    question: "Which package should I pick?",
    answer:
      "Pick the one that matches your training pace. 2x/week is fine for a relaxed schedule, 4x/week is the sweet spot, and unlimited is for serious students training 1-2 times a day.",
  },
];

function frequencyLabel(id: string): string {
  if (id === "dtv-6m-2x") return "2x / week";
  if (id === "dtv-6m-4x") return "4x / week";
  return "Unlimited";
}

export default function DTVVisaPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "DTV Visa Muay Thai Training Package",
    provider: {
      "@type": "Organization",
      name: "Chor Ratchawat Muay Thai Gym",
      url: "https://ratchawatmuaythai.com",
    },
    areaServed: { "@type": "Country", name: "Thailand" },
    serviceType: "Destination Thailand Visa enrollment",
    offers: DTV_PACKAGES.map((p) => ({
      "@type": "Offer",
      name: p.name,
      price: p.price,
      priceCurrency: "THB",
      availability: "https://schema.org/InStock",
      url: `https://ratchawatmuaythai.com/visa/dtv/apply?package=${p.id}`,
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          serviceSchema,
          articleSchema({
            title: "DTV Visa for Muay Thai Thailand 2026",
            description:
              "How to get a Destination Thailand Visa for Muay Thai training at Chor Ratchawat Koh Samui.",
            slug: "../visa/dtv",
            datePublished: "2026-01-01",
            dateModified: "2026-04-17",
          }),
          faqPageSchema(faqs),
        ]}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Visa" },
          { label: "DTV Visa" },
        ]}
      />

      {/* Hero */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <SectionLabel label="Destination Thailand Visa" />
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface">
            Train Muay Thai in Thailand for up to 180 days
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Chor Ratchawat is a registered Muay Thai gym in Koh Samui. Book your 6-month
            training package and get your official DTV enrollment letter within 24 hours.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/visa/dtv/apply" className="btn-primary">
              Apply for your DTV <span className="btn-arrow">&rarr;</span>
            </Link>
            <Link href="#packages" className="btn-ghost">
              See packages
            </Link>
          </div>
        </div>
      </section>

      {/* What is DTV */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <SectionLabel label="Overview" />
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
            What is the DTV Visa?
          </h2>
          <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              The DTV is a long-stay visa launched under Thailand&apos;s Soft Power programme.
              It is designed for foreigners who come to train or study recognised cultural
              and sports activities, and Muay Thai qualifies.
            </p>
            <p>
              You apply from your home country or online through the Thai e-visa portal. You
              get 180 days per entry, can extend at Thai immigration, and the visa is valid
              for 5 years with multiple entries.
            </p>
            <p>
              Our job is to provide the enrollment letter and supporting documents your
              embassy requires. You pick a 6-month package, we send the paperwork within
              24 hours, you submit your application.
            </p>
          </div>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map((b) => (
              <li
                key={b}
                className="flex items-start gap-3 text-on-surface-variant text-sm sm:text-base"
              >
                <Check size={18} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Packages */}
      <section
        id="packages"
        className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50"
      >
        <div className="max-w-6xl mx-auto">
          <SectionLabel label="Packages" />
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8 text-center">
            Pick your 6-month training package
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DTV_PACKAGES.map((pkg) => {
              const isPopular = pkg.popular;
              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-[var(--radius-card)] border-2 p-6 sm:p-7 flex flex-col ${
                    isPopular
                      ? "border-primary bg-primary/5"
                      : "border-outline-variant bg-surface-lowest"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      Most popular
                    </span>
                  )}
                  <p className="text-xs uppercase tracking-[0.19em] text-primary font-semibold mb-2">
                    {frequencyLabel(pkg.id)}
                  </p>
                  <h3 className="font-serif text-lg font-bold text-on-surface mb-3">
                    {pkg.name}
                  </h3>
                  <p className="font-serif text-3xl font-bold text-primary mb-1">
                    {pkg.price?.toLocaleString("en-US")} THB
                  </p>
                  <p className="text-on-surface-variant text-xs mb-5">
                    {pkg.unit}, all inclusive
                  </p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {pkg.includes.map((inc) => (
                      <li
                        key={inc}
                        className="flex items-start gap-2 text-on-surface-variant text-sm"
                      >
                        <Check
                          size={16}
                          className="text-primary shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/visa/dtv/apply?package=${pkg.id}`}
                    className={isPopular ? "btn-primary w-full justify-center" : "btn-ghost w-full justify-center"}
                  >
                    Apply with this package <span className="btn-arrow">&rarr;</span>
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-center text-on-surface-variant text-sm max-w-2xl mx-auto">
            No refund if the visa is refused, but we issue a training voucher of the same
            value. Documents are delivered within 24 hours of payment.
          </p>
        </div>
      </section>

      {/* Required Documents */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <SectionLabel label="Documents" />
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            What you need to apply
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {requirements.map((item, i) => (
              <GlassCard key={item.title} number={String(i + 1).padStart(2, "0")}>
                <item.icon size={28} className="text-primary mb-3" />
                <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                  {item.title}
                </h3>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  {item.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto">
          <SectionLabel label="Process" />
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            From click to Koh Samui
          </h2>
          <div className="relative pl-7">
            <div className="absolute left-[5px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary to-primary/30" />
            <div className="flex flex-col gap-6">
              {steps.map((s) => (
                <div key={s.step} className="relative flex items-start gap-4">
                  <div className="absolute -left-7 top-1 w-3 h-3 rounded-full bg-primary border-2 border-surface z-10" />
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-primary text-xs font-bold uppercase tracking-widest">
                        Step {s.step}
                      </span>
                      <s.icon size={16} className="text-on-surface-variant" aria-hidden="true" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-1">
                      {s.title}
                    </h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 space-y-3 text-on-surface-variant text-sm">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-primary" aria-hidden="true" />
              <span>
                Documents delivered within 24 hours. Embassy processing time
                varies between 5 and 15 business days.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Send size={18} className="text-primary" aria-hidden="true" />
              <span>
                Official DTV application portal:{" "}
                <a
                  href="https://thaievisa.go.th/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-link"
                >
                  thaievisa.go.th <span className="btn-arrow">&rarr;</span>
                </a>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <SectionLabel label="FAQ" />
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            Frequently Asked Questions
          </h2>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* See Also */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-2">
            Plan your stay
          </h2>
          <p className="text-on-surface-variant text-center text-sm mb-8 max-w-2xl mx-auto">
            Once your DTV is approved, here is what to sort out next.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <Link
              href="/accommodation"
              className="group flex flex-col rounded-card border-2 border-outline-variant bg-surface-lowest/60 p-6 hover:border-primary transition-colors"
            >
              <Home size={22} className="text-primary mb-4" />
              <h3 className="font-serif text-base font-bold text-on-surface mb-2 uppercase tracking-tight">
                Where to sleep
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-4 flex-1">
                On-site rooms and a bungalow at our Plai Laem camp. Walk to training in under a minute.
              </p>
              <span className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-[0.18em] group-hover:gap-2 transition-all">
                Accommodation
                <ArrowRight size={14} />
              </span>
            </Link>

            <Link
              href="/contact"
              className="group flex flex-col rounded-card border-2 border-outline-variant bg-surface-lowest/60 p-6 hover:border-primary transition-colors"
            >
              <MessageCircle size={22} className="text-primary mb-4" />
              <h3 className="font-serif text-base font-bold text-on-surface mb-2 uppercase tracking-tight">
                Still have questions?
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-4 flex-1">
                We answer DTV questions every week. WhatsApp, email, or contact form, your choice.
              </p>
              <span className="inline-flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-[0.18em] group-hover:gap-2 transition-all">
                Contact us
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Chor Ratchawat Muay Thai Gym in Koh Samui is a registered training provider for
            the Destination Thailand Visa (DTV), introduced under Thailand&apos;s Soft Power
            initiative. The DTV allows up to 180 days per entry and is valid for 5 years
            with multiple entries. Ratchawat offers three 6-month DTV training packages from
            20,000 THB, with the official enrollment letter delivered within 24 hours of
            payment.
          </p>
        </div>
      </section>

      <CTABanner
        kicker="Ready for the DTV?"
        title="Start your application"
        description="Fill the form, pay your package, get your documents in 24 hours."
        buttonText="Apply now"
        href="/visa/dtv/apply"
        ghostText="See pricing"
        ghostHref="/pricing"
      />
    </>
  );
}
