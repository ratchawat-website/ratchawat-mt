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
import { FileText, Clock, CheckCircle, Globe, Plane, CreditCard } from "lucide-react";
import Link from "next/link";

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
    "Get your Destination Thailand Visa (DTV) for Muay Thai training. Stay up to 180 days. Ratchawat Koh Samui provides the training letter. Apply now.",
  path: "/visa/dtv",
});

const requirements = [
  {
    icon: FileText,
    title: "Training Acceptance Letter",
    description: "We provide this. It confirms your enrollment at Ratchawat Muay Thai for your visa application.",
  },
  {
    icon: Globe,
    title: "Valid Passport",
    description: "At least 6 months validity remaining. You apply at a Thai embassy or consulate in your home country.",
  },
  {
    icon: CreditCard,
    title: "Proof of Funds",
    description: "Bank statements showing sufficient funds for your stay. Requirements vary by embassy.",
  },
  {
    icon: Plane,
    title: "Flight Itinerary",
    description: "Return or onward ticket, or a flight booking confirmation. Some embassies are flexible on this.",
  },
  {
    icon: Clock,
    title: "180 Days Per Entry",
    description: "The DTV allows up to 180 days in Thailand per entry. Extendable at Thai immigration.",
  },
  {
    icon: CheckCircle,
    title: "5-Year Validity",
    description: "The DTV is valid for 5 years with multiple entries. You can return to Thailand on the same visa.",
  },
];

const faqs = [
  {
    question: "What is the DTV visa?",
    answer:
      "The Destination Thailand Visa (DTV) is a long-stay visa for people coming to Thailand for specific activities including Muay Thai training. It allows up to 180 days per entry and is valid for 5 years with multiple entries.",
  },
  {
    question: "How long does the application take?",
    answer:
      "Processing time depends on the embassy. Typically 5 to 15 business days. We can have your training letter ready within 24 hours of booking.",
  },
  {
    question: "Do I need to be enrolled before applying?",
    answer:
      "Yes. You need a training acceptance letter from a registered gym. Book a training package with us and we provide the letter immediately.",
  },
  {
    question: "Can I work on a DTV visa?",
    answer:
      "No. The DTV is for training and cultural activities only. Working in Thailand requires a separate work permit.",
  },
  {
    question: "What training package do I need?",
    answer:
      "Any package works for the visa letter. Most DTV holders go with a monthly membership (5,500 THB/month) since they are staying long term.",
  },
  {
    question: "Can I extend the 180 days?",
    answer:
      "You can apply for an extension at Thai immigration before your 180 days expire. Extensions are typically 60 days. Or you can exit and re-enter on the same visa.",
  },
];

const steps = [
  { step: "1", title: "Book a training package", description: "Choose any package on our pricing page. Monthly is most common for DTV holders." },
  { step: "2", title: "Receive your training letter", description: "We send the official acceptance letter within 24 hours. This is the document your embassy needs." },
  { step: "3", title: "Apply at your embassy", description: "Submit the letter with your passport, photos, bank statement, and flight details to a Thai embassy or consulate." },
  { step: "4", title: "Fly to Koh Samui and train", description: "Once approved, come to Thailand and start training. Your 180 days begin on entry." },
];

export default function DTVVisaPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          articleSchema({
            title: "DTV Visa for Muay Thai Thailand 2026",
            description: "How to get a Destination Thailand Visa for Muay Thai training at Ratchawat Koh Samui.",
            slug: "../visa/dtv",
            datePublished: "2026-01-01",
            dateModified: "2026-04-02",
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

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-on-surface">
            Destination Thailand Visa (DTV) for Muay Thai
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Stay up to 180 days in Thailand on a single entry. We provide the training letter your embassy needs.
          </p>
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
              The DTV is Thailand&apos;s long-stay visa for people coming to train, study, or participate in cultural activities. Muay Thai qualifies. The visa gives you 180 days per entry and is valid for 5 years, so you can come and go.
            </p>
            <p>
              You apply at a Thai embassy or consulate before traveling. The main thing they need from us is a training acceptance letter confirming your enrollment at a registered gym. We handle that part.
            </p>
            <p>
              The DTV replaced the old tourist visa extensions that people used to cobble together for long stays. It is simpler, longer, and specifically designed for people like you.
            </p>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <SectionLabel label="Documents" />
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            Requirements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* How to Apply */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <SectionLabel label="Process" />
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            How to Apply with Ratchawat
          </h2>
          <div className="relative pl-7">
            {/* Vertical line */}
            <div className="absolute left-[5px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary to-primary/30" />
            <div className="flex flex-col gap-5">
              {steps.map((s) => (
                <div key={s.step} className="relative flex items-start gap-4">
                  {/* Dot */}
                  <div className="absolute -left-7 top-1 w-3 h-3 rounded-full bg-primary border-2 border-surface z-10" />
                  <div>
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
        </div>
      </section>

      {/* Training Packages */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto">
          <SectionLabel label="Packages" />
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
            Training Packages for DTV Holders
          </h2>
          <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              Most DTV holders train on a monthly basis. The monthly membership is 5,500 THB (~$167 USD) and covers all group sessions at both camps. Private lessons can be added on top.
            </p>
            <p>
              You are not locked into a specific schedule. Train as much or as little as you want. Many long-stay students train 5 or 6 days a week, take a break, then come back.{" "}
              <Link href="/pricing" className="btn-link">See full pricing <span className="btn-arrow">&rarr;</span></Link>.
            </p>
            <p>
              Need a place to stay?{" "}
              <Link href="/accommodation" className="btn-link">Accommodation options <span className="btn-arrow">&rarr;</span></Link>
              {" "}are available near both camps.
            </p>
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
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto text-center text-on-surface-variant text-base">
          <p>
            Looking for a shorter stay? Check the{" "}
            <Link href="/visa/90-days" className="btn-link">90-day Muay Thai visa <span className="btn-arrow">&rarr;</span></Link>
            .{" "}
            Ready to book?{" "}
            <Link href="/booking" className="btn-link">Reserve your training <span className="btn-arrow">&rarr;</span></Link>.
          </p>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            The Destination Thailand Visa (DTV) allows foreigners to stay in Thailand for up to 180 days per entry for Muay Thai training. Chor Ratchawat Muay Thai Gym in Koh Samui provides the required training acceptance letter for DTV visa applications. The gym supports the full application process and offers dedicated training packages for long-stay visa holders.
          </p>
        </div>
      </section>

      <CTABanner
        title="Get Your DTV Visa Letter"
        description="Book a training package and receive your acceptance letter within 24 hours."
        buttonText="Book Now"
        href="/booking"
        ghostText="View Pricing"
        ghostHref="/pricing"
      />
    </>
  );
}
