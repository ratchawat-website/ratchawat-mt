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
import {
  Swords,
  Zap,
  Brain,
  Timer,
  Dumbbell,
  Shield,
  HandCoins,
  ListChecks,
  UserCheck,
  CalendarCheck,
  MapPin,
} from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Fighter Program Koh Samui | Ratchawat - 9,500 THB/Month",
  description:
    "Fighter program at Ratchawat Plai Laem, Koh Samui. Structured prep, 2 sessions/day, conditioning, fight organisation. Keep 100% of your fight purse.",
  path: "/programs/fighter",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const fighterCourse = courseSchema({
  name: "Fighter Training Program",
  description:
    "Fighter program at Ratchawat Plai Laem, Koh Samui. Structured preparation, 2 sessions per day, kettlebell conditioning, fight organization, and corner support. Fighters keep 100% of their fight purse.",
  url: `${SITE_URL}/programs/fighter`,
});

const differentiators = [
  {
    icon: HandCoins,
    title: "Keep Your Full Fight Purse",
    description:
      "You take home 100% of what the promoter pays. No camp commission, no hidden deductions. What you earn in the ring is what ends up in your pocket.",
    featured: true,
  },
  {
    icon: ListChecks,
    title: "Structured Preparation",
    description:
      "A written plan built around your fight date. Morning technique, afternoon sparring, conditioning slotted between. Not a pick-and-choose class timetable.",
  },
  {
    icon: UserCheck,
    title: "Personalized Coaching",
    description:
      "Trainers track your progress session by session. They know your weaknesses, your opponent, and what to fix before the next round. Corrections made for you, not for the room.",
  },
  {
    icon: Dumbbell,
    title: "Real Conditioning Block",
    description:
      "Kettlebell circuits, strength, and cardio two to three times a week. Separate from pad work. The engine building that fighters actually need.",
  },
  {
    icon: CalendarCheck,
    title: "Fight Organization",
    description:
      "We match you with fights at the right level and the right moment. Weigh-ins, logistics, paperwork, and your corner on fight night are handled by the camp.",
  },
  {
    icon: MapPin,
    title: "Plai Laem Only, Fighters Only",
    description:
      "The program runs at one camp, with fighters. No tourist group classes, no split focus. The space, trainers, and schedule are built around ring preparation.",
  },
];

const trainingBlocks = [
  {
    icon: Timer,
    title: "Morning Run",
    time: "7:30 AM",
    description: "Running to start the day, then straight into the morning training block.",
  },
  {
    icon: Swords,
    title: "Morning Training",
    time: "8:00 - 10:00",
    description: "Technique drills, pad work, and clinch. Structured around your fight schedule.",
  },
  {
    icon: Dumbbell,
    title: "Conditioning",
    time: "2-3x / week",
    description: "Kettlebell circuits, strength, and conditioning. The work that keeps you in the ring longer.",
  },
  {
    icon: Zap,
    title: "Afternoon Session",
    time: "4:00 - 6:30 PM",
    description: "Running followed by sparring, bag rounds, and targeted work. Six days a week, Plai Laem only.",
  },
];

const whatYouNeed = [
  {
    icon: Brain,
    title: "Prior Experience",
    description: "This is not a beginner program. You should have at least 6 months of Muay Thai or similar striking experience.",
  },
  {
    icon: Shield,
    title: "Your Own Gear",
    description: "Gloves, shin guards, mouthguard, groin guard. If you are here to fight, bring your equipment.",
  },
  {
    icon: Swords,
    title: "The Right Mindset",
    description: "You will get hit in sparring. You will be exhausted. That is the point. Come ready for it.",
  },
];

export default function FighterProgramPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), fighterCourse]} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Programs", href: "/programs" },
          { label: "Fighter Program" },
        ]}
      />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">FIGHTER CAMP · PLAI LAEM ONLY</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface">
            Fighter Training Program
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            For athletes who want to compete. Two sessions a day, six days a week, Plai Laem only.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">OVERVIEW</span><span className="w-8 h-[2px] bg-primary" /></div>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
              Built for Fighters, Not Tourists
            </h2>
            <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
              <p>
                Group classes teach you Muay Thai. They do not prepare you to fight. Sparring volume, conditioning, matchmaking, a corner on fight night: none of that is in a drop-in timetable.
              </p>
              <p>
                The fighter program is the opposite: a structured, strict month of training built around your fight date and run at our Plai Laem camp only. Morning run into technique and pad work, afternoon sparring, kettlebell and conditioning two to three times a week. Written plan, daily tracking, real corrections.
              </p>
              <p>
                Ratchawat fighters have stepped into the ring at Rajadamnern Stadium, One Lumpinee, and RWS. If you come in with experience, we sharpen what you already have. If you come in to get ring-ready for the first time, we build you up session by session.
              </p>
            </div>
          </div>
          <div className="relative aspect-[9/16] rounded-card overflow-hidden">
            <Image
              src="/images/programs/program-fighter.jpg"
              alt="Ratchawat fighter program training at Plai Laem camp"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Why This Program / Differentiators */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">WHY THIS PROGRAM</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            What You Get That You Will Not Find Elsewhere
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {differentiators.map((item, i) => {
              const isFeatured = item.featured;
              return (
                <div
                  key={item.title}
                  className={`relative rounded-[var(--radius-card)] p-6 transition-colors ${
                    isFeatured
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-surface-lowest/60 border-2 border-outline-variant"
                  }`}
                >
                  {isFeatured && (
                    <span className="absolute -top-3 left-6 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-surface bg-primary rounded">
                      Unique to Ratchawat
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <item.icon
                      size={28}
                      className={isFeatured ? "text-primary" : "text-primary"}
                    />
                    <span className="text-xs font-mono text-on-surface-variant">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                    {item.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Training Schedule */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">DAILY SCHEDULE</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            Typical Training Day
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainingBlocks.map((block, i) => (
              <GlassCard key={block.title} number={String(i + 1).padStart(2, "0")}>
                <div className="flex items-center gap-3 mb-3">
                  <block.icon size={24} className="text-primary" />
                  <span className="badge-underline badge-neutral">
                    {block.time}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                  {block.title}
                </h3>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  {block.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Prerequisites */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">PREREQUISITES</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            What You Need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {whatYouNeed.map((item, i) => (
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

      {/* Pricing & Stay */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">PRICING & STAY</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
            Pricing & Accommodation
          </h2>
          <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              Fighter training alone: 9,500 THB per month. Includes training 2x per day, weekly stretch and yoga class, weekly ice bath, fight organization, and corner support on fight day.{" "}
              <Link href="/pricing" className="text-primary hover:text-primary-dim transition-colors font-medium">See full pricing</Link>.
            </p>
            <p>
              You can add on-site accommodation at our Plai Laem camp. Two tiers available:
            </p>
            <ul className="ml-4 space-y-2 text-base">
              <li>
                <strong className="text-on-surface">Fighter + Standard Room:</strong> approximately 20,000 THB per month (electricity separate). Pending final price confirmation.
              </li>
              <li>
                <strong className="text-on-surface">Fighter + Private Bungalow:</strong> 25,500 THB per month (electricity separate). Premium tier with king bed, kitchenette, and private terrace. Only 1 bungalow on-site.
              </li>
            </ul>
            <p>
              See the{" "}
              <Link href="/accommodation" className="text-primary hover:text-primary-dim transition-colors font-medium">accommodation page</Link>
              {" "}for photos, amenities, and the full Camp Stay packages. Contact us to lock in your dates.
            </p>
            <p>
              Meet the{" "}
              <Link href="/team" className="text-primary hover:text-primary-dim transition-colors font-medium">trainers</Link>
              {" "}who will be in your corner.
            </p>
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            The Ratchawat fighter program runs at our Plai Laem camp in Koh Samui, Thailand, for 9,500 THB per month. Training includes two sessions a day six days a week, kettlebell and conditioning, fight organization, corner support, and weekly stretch and ice bath recovery. Fighters keep 100% of their fight purse (no camp commission). Ratchawat fighters have competed at Rajadamnern Stadium, One Lumpinee, and RWS.
          </p>
        </div>
      </section>

      <CTABanner
        title="Ready to Fight?"
        description="9,500 THB/month at Plai Laem. Full purse, corner support, structured prep. Room and bungalow tiers available."
        buttonText="Apply Now"
        href="/booking/fighter?package=fighter-monthly"
        ghostText="View All Prices"
        ghostHref="/pricing"
      />
    </>
  );
}
