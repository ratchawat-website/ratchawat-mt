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
      "No. Most of our students arrive with zero experience. Trainers walk you through stance, movement, and the basic strikes in the first session, then build from there. Beginners and seasoned fighters train in the same class, with the trainer adjusting intensity for each person.",
  },
  {
    question: "What should I bring to training?",
    answer:
      "Shorts and a t-shirt. That is it. Gloves and shin guards are available at the gym if you do not have your own. If you plan to train for more than a week, buying your own gloves on the island is cheap and easy.",
  },
  {
    question: "What time are the classes?",
    answer:
      "Group classes run at 9:00 AM and 5:00 PM, Monday to Saturday. Sunday is rest day. Private lessons can be booked at 7:00, 8:00, or between 10:00 and 17:00, any day Monday to Saturday.",
  },
  {
    question: "Can I drop in for a single session?",
    answer:
      "Yes. Drop-in is 400 THB for adults, 300 THB for kids. No booking required for group classes, just show up 10 minutes early. Private lessons need to be booked in advance so we can hold a trainer for you.",
  },
  {
    question: "Do you offer training for kids?",
    answer:
      "Yes. Group classes are for kids aged 8 to 13. Younger kids from age 3 train through private sessions only, for safety and pace. Several Ratchawat kids have competed in local tournaments on Koh Samui.",
  },
  {
    question: "Is the gym suitable for women?",
    answer:
      "Yes. Women train at Ratchawat every day, solo and in groups. Reviews include repeat visits from female students, and the trainers adjust the session to your level. Both camps hold a 5.0 rating on Google.",
  },
  {
    question: "Do the trainers speak English?",
    answer:
      "Yes. All of our Thai trainers teach in English, enough to explain technique, give corrections, and run a full class. The team has years of experience with international students.",
  },
  {
    question: "Can you help with visa applications?",
    answer:
      "Yes, for the Destination Thailand Visa (DTV). We provide the official enrollment letter and supporting documents within 24 hours of booking a 6-month DTV training package. You submit your application on the Thai e-visa portal. We no longer assist with the 90-day education visa.",
  },
  {
    question: "What is the Fighter Program?",
    answer:
      "A 9,500 THB monthly program for athletes who want to compete. Two sessions a day, six days a week, plus kettlebell conditioning, weekly yoga and ice bath, fight matchmaking, and a corner on fight night. Ratchawat fighters keep 100% of their fight purse, with no camp commission. Runs at Plai Laem only.",
  },
  {
    question: "What is the difference between Bo Phut and Plai Laem?",
    answer:
      "Bo Phut is the original camp, small and street-level, on Soi Sunday near Fisherman's Village. Plai Laem is larger, with a dedicated bodyweight and conditioning area, near Big Buddha. Same trainers rotate between both. The Fighter Program runs at Plai Laem only. On-site accommodation is at Plai Laem only.",
  },
  {
    question: "Do you have accommodation on-site?",
    answer:
      "Yes, at our Plai Laem camp. 7 standard rooms with pool-view balcony and 1 private bungalow with kitchenette. Camp Stay packages combine training and accommodation from 8,000 THB per week. See the accommodation page for photos and pricing.",
  },
  {
    question: "How do I get to the gym?",
    answer:
      "Bo Phut is on Soi Sunday, near Fisherman's Village, northeast Koh Samui. Plai Laem is on Plai Laem Soi 13, near Big Buddha. Most students rent a scooter (around 200 THB per day). Grab and songthaew (shared taxis) also reach both areas.",
  },
  {
    question: "Can I book and pay online?",
    answer:
      "Yes. You can book any program and pay securely through our site via Stripe. You get an email confirmation with the details right after payment.",
  },
  {
    question: "What if I need to change or cancel my booking?",
    answer:
      "Message us on WhatsApp or email as soon as you know. For group classes, rescheduling is usually straightforward. For private sessions booked less than 12 hours ahead, we handle it through WhatsApp instead of online booking.",
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
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface">
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
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">LEARN MORE</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
            More Info
          </h2>
          <div className="space-y-3 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              <Link href="/pricing" className="text-primary hover:text-primary-dim transition-colors font-medium">Pricing</Link>
              {" "}: drop-in, weekly, monthly rates and private lesson costs.
            </p>
            <p>
              <Link href="/visa/dtv" className="text-primary hover:text-primary-dim transition-colors font-medium">DTV visa</Link>
              {" "}: how we can help with your Thailand long-stay visa application.
            </p>
            <p>
              <Link href="/accommodation" className="text-primary hover:text-primary-dim transition-colors font-medium">Accommodation</Link>
              {" "}: where to stay near both camps.
            </p>
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Chor Ratchawat Muay Thai Gym in Koh Samui, Thailand runs group classes at 9:00 AM and 5:00 PM, Monday to Saturday. Drop-in is 400 THB for adults and 300 THB for kids. The gym has two camps, Bo Phut and Plai Laem, welcomes complete beginners, and rents gear on-site. The Fighter Program (9,500 THB per month) and on-site accommodation are at the Plai Laem camp. DTV visa documents are delivered within 24 hours of booking a 6-month package.
          </p>
        </div>
      </section>

      <CTABanner
        title="Still Have Questions?"
        description="Message us on WhatsApp or send an email. We reply fast."
        buttonText="Contact Us"
        href="/contact"
        ghostText="Book Now"
        ghostHref="/booking"
      />
    </>
  );
}
