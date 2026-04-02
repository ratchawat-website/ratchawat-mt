import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import FAQAccordion from "@/components/ui/FAQAccordion";
import CTABanner from "@/components/ui/CTABanner";
import JsonLd from "@/components/seo/JsonLd";
import {
  organizationSchema,
  faqPageSchema,
} from "@/components/seo/SchemaOrg";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "FAQ | Muay Thai Training at Ratchawat Koh Samui",
  description:
    "Frequently asked questions about Muay Thai training at Ratchawat Koh Samui. Levels, what to bring, schedules, visas, pricing & more.",
  path: "/faq",
});

const faqs = [
  {
    question: "Do I need experience to train Muay Thai?",
    answer:
      "No. Most of our students are complete beginners. Trainers adapt every session to your level. You will learn the basics quickly and build from there.",
  },
  {
    question: "What should I bring to training?",
    answer:
      "Shorts and a t-shirt. That is it. Gloves and shin guards are available to rent at the gym (100 THB per session). If you plan to train regularly, buying your own gloves on the island is easy and cheap.",
  },
  {
    question: "What time are the classes?",
    answer:
      "Group classes run at 8 AM, 4 PM, and 6 PM Monday through Friday, with a morning session on Saturday. Sunday is rest day. Private lessons can be booked at other times.",
  },
  {
    question: "Can I drop in for a single session?",
    answer:
      "Yes. Drop-in is 500 THB per session. No booking required for group classes. Just show up 10 minutes early. Private lessons should be booked in advance.",
  },
  {
    question: "Do you offer training for kids?",
    answer:
      "Yes. We run kids classes for ages 5 to 15. The sessions focus on fundamentals, discipline, and fitness in a safe environment. Several Ratchawat kids have competed in local tournaments.",
  },
  {
    question: "Is the gym suitable for women?",
    answer:
      "Absolutely. Women train at Ratchawat every day. We have a female trainer (Teacher Nangja) on the team. The gym is listed as female-friendly on MuayThaiMap.",
  },
  {
    question: "Can you help with visa applications?",
    answer:
      "We can provide documentation for the DTV (Destination Thailand Visa, 180 days) and the 90-day Muay Thai education visa. We handle the gym-side paperwork. You handle the embassy application.",
  },
  {
    question: "Do you have accommodation nearby?",
    answer:
      "We partner with US Hostel / US Samui near the Bo Phut camp. There are also guesthouses and apartments near both locations. We can point you in the right direction.",
  },
  {
    question: "How do I get to the gym?",
    answer:
      "Bo Phut camp is on Soi Sunday, near Fisherman's Village. Plai Laem camp is on Plai Laem Soi 13, near Big Buddha. Most students rent a scooter (200 THB/day). Grab and songthaew also work.",
  },
  {
    question: "Can I book and pay online?",
    answer:
      "Yes. You can book sessions and pay securely through our website via Stripe. You will receive an email confirmation with all the details.",
  },
];

export default function FAQPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          faqPageSchema(faqs),
        ]}
      />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
      />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-on-surface">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            The questions we get asked the most. If yours is not here,{" "}
            <Link href="/contact" className="text-primary hover:text-primary-dim transition-colors font-medium">
              get in touch
            </Link>.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-on-surface mb-6">
            More Info
          </h2>
          <div className="space-y-3 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              <Link href="/pricing" className="text-primary hover:text-primary-dim transition-colors font-medium">Pricing</Link>
              {" "}: drop-in, weekly, monthly rates and private lesson costs.
            </p>
            <p>
              <Link href="/visa/dtv" className="text-primary hover:text-primary-dim transition-colors font-medium">DTV visa</Link>
              {" "}and{" "}
              <Link href="/visa/90-days" className="text-primary hover:text-primary-dim transition-colors font-medium">90-day visa</Link>
              {" "}: how we can help with your Thai visa application.
            </p>
            <p>
              <Link href="/accommodation" className="text-primary hover:text-primary-dim transition-colors font-medium">Accommodation</Link>
              {" "}: where to stay near both camps.
            </p>
          </div>
        </div>
      </section>

      <CTABanner
        title="Still Have Questions?"
        description="Message us on WhatsApp or send an email. We reply fast."
        buttonText="Contact Us"
        href="/contact"
      />
    </>
  );
}
