import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import CTABanner from "@/components/ui/CTABanner";
import Image from "next/image";
import JsonLd from "@/components/seo/JsonLd";
import {
  organizationSchema,
  courseSchema,
} from "@/components/seo/SchemaOrg";
import { UserCheck, Target, Clock, Flame } from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Private Muay Thai Lessons Koh Samui | 1-on-1 - Ratchawat",
  description:
    "Book private Muay Thai lessons in Koh Samui with experienced Thai trainers. Personalized 1-on-1 sessions. All levels. Book & pay online.",
  path: "/programs/private",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const privateCourse = courseSchema({
  name: "Private Muay Thai Lessons",
  description:
    "One-on-one Muay Thai training with experienced Thai trainers at Ratchawat Koh Samui. Fully personalized sessions.",
  url: `${SITE_URL}/programs/private`,
  offers: { price: 800, priceCurrency: "THB" },
});

const trainers = [
  {
    name: "Kru Ratchawat",
    role: "Founder & Head Coach",
    description: "25 years in Muay Thai, 450 fights, 15 years coaching. C-license certified. Calm and technical, demanding when it matters.",
    image: "/images/trainers/trainer-ratchawat.jpeg",
    imageAlt: "Kru Ratchawat, founder and head coach of Ratchawat Muay Thai",
  },
  {
    name: "Kru Kuan",
    role: "Head Trainer, Bo Phut",
    description: "Three-time Muay Thai champion, 280 fights. Knee fighter with a sharp clinch. Runs the most demanding pad rounds at the camp.",
    image: "/images/trainers/trainer-kuan.jpeg",
    imageAlt: "Kru Kuan, head trainer at Ratchawat Bo Phut",
  },
  {
    name: "Kru Mam",
    role: "Trainer",
    description: "Southern Thailand Champion at 126 lbs, 500 fights, 20 years in the ring. Knee fighter, pad work specialist.",
    image: "/images/trainers/trainer-mam.jpeg",
    imageAlt: "Kru Mam, trainer at Ratchawat Plai Laem",
  },
];

const reasons = [
  {
    icon: UserCheck,
    title: "Your Pace",
    description: "The trainer adapts to what you need. Basics, advanced technique, fight prep, or just fitness.",
  },
  {
    icon: Target,
    title: "Full Attention",
    description: "Every round, every correction is for you. You learn faster this way.",
  },
  {
    icon: Clock,
    title: "Flexible Timing",
    description: "Book outside group class hours. Morning, midday, whatever fits your schedule.",
  },
  {
    icon: Flame,
    title: "Custom Intensity",
    description: "Want a light technical session? Hard conditioning? Your call.",
  },
];

export default function PrivateLessonsPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), privateCourse]} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Programs", href: "/programs" },
          { label: "Private Lessons" },
        ]}
      />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">PRIVATE TRAINING</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface">
            Private Muay Thai Lessons
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            One-on-one with a Thai trainer. Your level, your goals, your session.
          </p>
        </div>
      </section>

      {/* Why Private */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">WHY PRIVATE</span><span className="w-8 h-[2px] bg-primary" /></div>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
              Why Go Private
            </h2>
            <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
              <p>
                Group classes are great for the energy and routine. But if you want to drill specific things, work at your own speed, or just get more pad time with a trainer, a private session is the way to go.
              </p>
              <p>
                Each session lasts about an hour. The trainer will ask what you want to work on, then build the session around that. If you are not sure, they will figure out where you are and take it from there.
              </p>
              <p>
                Private lessons work well combined with group classes. Train with the group in the morning, do a private in the afternoon to polish what you learned.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {reasons.map((item, i) => (
              <GlassCard key={item.title} number={String(i + 1).padStart(2, "0")}>
                <item.icon size={24} className="text-primary mb-2" />
                <h3 className="font-serif text-base font-bold text-on-surface uppercase mb-1">
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

      {/* Trainers */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">TRAINERS</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            Your Trainers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
              <GlassCard key={trainer.name}>
                <div className="relative aspect-square rounded-card overflow-hidden mb-4">
                  <Image
                    src={trainer.image}
                    alt={trainer.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-1">
                  {trainer.name}
                </h3>
                <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                  {trainer.role}
                </p>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  {trainer.description}
                </p>
              </GlassCard>
            ))}
          </div>
          <p className="mt-6 text-on-surface-variant text-base">
            Get to know the full team on the{" "}
            <Link href="/team" className="text-primary hover:text-primary-dim transition-colors font-medium">trainers page</Link>.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">PRICING</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
            Pricing & Booking
          </h2>
          <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              Private sessions start at 800 THB per hour.{" "}
              <Link href="/pricing" className="text-primary hover:text-primary-dim transition-colors font-medium">See full pricing</Link>.
            </p>
            <p>
              Book online and pay securely through Stripe, or message us on WhatsApp to arrange a time.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center justify-between p-4 bg-surface-lowest rounded-lg">
              <span className="text-on-surface text-sm font-medium">1-on-1 adult</span>
              <span className="font-serif text-2xl font-bold text-primary">800 <span className="text-xs font-normal text-on-surface-variant">THB</span></span>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-lowest rounded-lg">
              <span className="text-on-surface text-sm font-medium">Group 2-3 adults</span>
              <span className="font-serif text-2xl font-bold text-primary">600 <span className="text-xs font-normal text-on-surface-variant">THB/person</span></span>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-lowest rounded-lg">
              <span className="text-on-surface text-sm font-medium">1-on-1 kids</span>
              <span className="font-serif text-2xl font-bold text-primary">600 <span className="text-xs font-normal text-on-surface-variant">THB</span></span>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-lowest rounded-lg">
              <span className="text-on-surface text-sm font-medium">Group 2-3 kids</span>
              <span className="font-serif text-2xl font-bold text-primary">400 <span className="text-xs font-normal text-on-surface-variant">THB/kid</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Private 1-on-1 Muay Thai lessons at Chor Ratchawat in Koh Samui run 60 minutes for 800 THB per session. Available with experienced Thai trainers including Kru Ratchawat (Founder), Kru Kuan (Head Trainer Bo Phut), and Kru Mam (Southern Thailand Champion). Slots run between 7:00 and 17:00, Monday to Saturday, at both Bo Phut and Plai Laem. Booking cutoff is 12 hours before the 7:00 and 8:00 slots, 2 hours before any other slot.
          </p>
        </div>
      </section>

      <CTABanner
        title="Book a Private Session"
        description="From 800 THB per hour. Fully personalized, your pace."
        buttonText="Book Now"
        href="/booking/private?package=private-adult-solo"
        ghostText="View Pricing"
        ghostHref="/pricing"
      />
    </>
  );
}
