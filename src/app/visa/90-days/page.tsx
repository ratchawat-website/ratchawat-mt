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
import { FileText, Clock, CheckCircle, BookOpen, Dumbbell, RefreshCw } from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "90-Day Muay Thai Visa Thailand | Education Visa \u2014 Ratchawat",
  description:
    "Apply for a 90-day Muay Thai education visa in Thailand. Train at Ratchawat Koh Samui for 3 months. We handle the paperwork. Apply online.",
  path: "/visa/90-days",
});

const highlights = [
  {
    icon: Clock,
    title: "90 Days",
    description: "Three months of daily training. Enough time to build real skill and conditioning.",
  },
  {
    icon: BookOpen,
    title: "Education Visa",
    description: "Classified as a non-immigrant ED visa. Muay Thai is recognized as a sport education activity.",
  },
  {
    icon: FileText,
    title: "We Handle Paperwork",
    description: "Ratchawat provides all gym-side documents: enrollment letter, curriculum, and training schedule.",
  },
  {
    icon: Dumbbell,
    title: "Daily Training Included",
    description: "Your 90-day package covers all group sessions at both camps, six days a week.",
  },
  {
    icon: RefreshCw,
    title: "Renewable",
    description: "The 90-day visa can be extended at Thai immigration. We can provide updated documentation.",
  },
  {
    icon: CheckCircle,
    title: "Real Training, Real Visa",
    description: "This is not a paper gym. You train every day with Thai trainers. Immigration knows the difference.",
  },
];

const faqs = [
  {
    question: "What is the 90-day Muay Thai visa?",
    answer:
      "It is a non-immigrant education visa (ED visa) that allows you to stay in Thailand for 90 days to train Muay Thai. The visa recognizes Muay Thai as a sport education activity.",
  },
  {
    question: "How is it different from the DTV?",
    answer:
      "The DTV gives you 180 days and is easier to get. The 90-day ED visa is more structured, requires a training curriculum, and is specifically for education. The DTV is newer and more flexible. Many students now prefer the DTV.",
  },
  {
    question: "What documents do I need?",
    answer:
      "From us: enrollment letter, training curriculum, gym registration documents. From you: passport (6+ months validity), photos, proof of funds, and your embassy application form.",
  },
  {
    question: "Can I extend beyond 90 days?",
    answer:
      "Yes. You can apply for an extension at Thai immigration before your visa expires. We provide updated documents for the extension.",
  },
  {
    question: "How much training is required?",
    answer:
      "Immigration expects you to actually train. At Ratchawat, the package includes daily group sessions. Most 90-day visa holders train 5 to 6 days a week.",
  },
  {
    question: "What does the training package cost?",
    answer:
      "The 90-day package uses monthly membership pricing: 5,500 THB per month (16,500 THB for 3 months). Private lessons are extra. See our pricing page for details.",
  },
];

const steps = [
  { step: "1", title: "Contact us", description: "Tell us your planned dates. We will confirm availability and explain what your specific embassy requires." },
  { step: "2", title: "Book a 3-month package", description: "Pay for the first month to start. We prepare all gym documents: enrollment letter, curriculum, training plan." },
  { step: "3", title: "Apply at your embassy", description: "Submit our documents with your passport and other requirements. Processing time depends on the embassy (5-15 business days)." },
  { step: "4", title: "Train for 3 months", description: "Arrive in Koh Samui and start daily training. We track attendance for immigration if needed." },
];

export default function NinetyDayVisaPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          articleSchema({
            title: "90-Day Muay Thai Visa Thailand",
            description: "How to get a 90-day Muay Thai education visa for training at Ratchawat Koh Samui.",
            slug: "../visa/90-days",
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
          { label: "90-Day Visa" },
        ]}
      />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-on-surface">
            90-Day Muay Thai Visa
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Three months of daily training in Koh Samui. We provide the documents, you handle the embassy.
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-on-surface mb-6">
            The 90-Day Education Visa
          </h2>
          <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              The 90-day Muay Thai visa is a non-immigrant ED (education) visa. Thailand recognizes Muay Thai as a sport education activity, so registered gyms like Ratchawat can sponsor students for this visa category.
            </p>
            <p>
              This visa is for people who want to train seriously for three months. Daily sessions, structured progression, real coaching. It is not for people who want to sit on the beach and occasionally drop in.
            </p>
            <p>
              If you want more flexibility and a longer stay, the{" "}
              <Link href="/visa/dtv" className="text-primary hover:text-primary-dim transition-colors font-medium">DTV visa (180 days)</Link>
              {" "}might be a better fit.
            </p>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-on-surface mb-8">
            What You Get
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((item) => (
              <GlassCard key={item.title}>
                <item.icon size={28} className="text-primary mb-3" />
                <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                  {item.title}
                </h3>
                <p className="text-on-surface-variant text-sm">
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
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-on-surface mb-8">
            How to Apply
          </h2>
          <div className="space-y-6">
            {steps.map((s) => (
              <div key={s.step} className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center text-lg">
                  {s.step}
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-on-surface mb-1">
                    {s.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm sm:text-base">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-on-surface mb-6">
            Pricing
          </h2>
          <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              The 3-month training package is 5,500 THB per month (16,500 THB total for 90 days). This covers all group sessions at both camps. Private lessons are available at additional cost.{" "}
              <Link href="/pricing" className="text-primary hover:text-primary-dim transition-colors font-medium">See full pricing</Link>.
            </p>
            <p>
              Many 90-day students also train in the{" "}
              <Link href="/programs/fighter" className="text-primary hover:text-primary-dim transition-colors font-medium">fighter program</Link>
              {" "}with multiple daily sessions. Need a place to stay?{" "}
              <Link href="/accommodation" className="text-primary hover:text-primary-dim transition-colors font-medium">Accommodation</Link>
              {" "}is available near both camps.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-on-surface mb-8">
            Frequently Asked Questions
          </h2>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Ratchawat Muay Thai in Koh Samui supports 90-day Muay Thai education visa applications for Thailand. The 3-month visa allows intensive daily training. The gym provides all required documentation and supports the visa renewal process. Training packages for 90-day visa holders include daily group classes and optional private sessions.
          </p>
        </div>
      </section>

      <CTABanner
        title="Apply for a 90-Day Visa"
        description="Contact us to start the paperwork. Training letter ready in 24 hours."
        buttonText="Contact Us"
        href="/contact"
      />
    </>
  );
}
