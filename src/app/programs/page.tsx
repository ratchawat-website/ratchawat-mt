import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import CTABanner from "@/components/ui/CTABanner";
import ProgramCard from "@/components/ui/ProgramCard";
import JsonLd from "@/components/seo/JsonLd";
import {
  organizationSchema,
  courseSchema,
} from "@/components/seo/SchemaOrg";
import { Users, Baby, UserCheck, Swords } from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Muay Thai Programs Koh Samui | Group, Private, Kids & Fighter",
  description:
    "Choose your Muay Thai program at Ratchawat Koh Samui. Group classes, private lessons, kids training, and fighter camp. All levels welcome.",
  path: "/programs",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const programs = [
  {
    title: "Group Classes (Adults)",
    description:
      "Morning and evening sessions open to all levels. Warm-up, technique drills, pad work, and conditioning. The most popular way to train at Ratchawat.",
    href: "/programs/group-adults",
    icon: Users,
    level: "All Levels",
    duration: "1.5 hours",
  },
  {
    title: "Kids Classes",
    description:
      "Muay Thai for kids 8 to 13 in groups, or private from age 3. Real technique, safe pace, Thai coaches used to teaching children. Several have gone on to win local fights.",
    href: "/programs/group-kids",
    icon: Baby,
    level: "Ages 8-13 (group), 3+ (private)",
    duration: "1 hour",
  },
  {
    title: "Private Lessons",
    description:
      "One-on-one with a Thai trainer. Sessions tailored to your level and goals, whether you are working on basics or preparing for something specific.",
    href: "/programs/private",
    icon: UserCheck,
    level: "All Levels",
    duration: "1 hour",
  },
  {
    title: "Fighter Program",
    description:
      "Intensive training for athletes preparing to compete. Technique refinement, sparring, conditioning, and fight strategy. Not for beginners.",
    href: "/programs/fighter",
    icon: Swords,
    level: "Advanced",
    duration: "2-3 hours",
  },
];

const courseSchemas = programs.map((p) =>
  courseSchema({
    name: p.title,
    description: p.description,
    url: `${SITE_URL}${p.href}`,
  }),
);

export default function ProgramsPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), ...courseSchemas]} />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Programs" }]}
      />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">PROGRAMS</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface">
            Training Programs
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Four programs across two camps. Pick the one that fits where you are right now.
          </p>
        </div>
      </section>

      {/* Program Cards */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {programs.map((program, i) => (
            <ProgramCard key={program.href} {...program} number={String(i + 1).padStart(2, "0")} />
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">GETTING STARTED</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
            How It Works
          </h2>
          <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              All programs run at both{" "}
              <Link href="/camps/bo-phut" className="text-primary hover:text-primary-dim transition-colors font-medium">Bo Phut</Link>
              {" "}and{" "}
              <Link href="/camps/plai-laem" className="text-primary hover:text-primary-dim transition-colors font-medium">Plai Laem</Link>
              . Same trainers, same schedule. Pick whichever camp is closer to where you are staying.
            </p>
            <p>
              No experience needed for group or private sessions. Show up in shorts and a t-shirt. Gloves and shin guards are available to rent at the gym.
            </p>
            <p>
              Drop-in sessions start at 400 THB. Weekly and monthly packages bring the price down.{" "}
              <Link href="/pricing" className="text-primary hover:text-primary-dim transition-colors font-medium">See full pricing</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Chor Ratchawat Muay Thai in Koh Samui offers four training programs: adult group classes (from 400 THB drop-in, 5,500 THB monthly), kids classes ages 8-13 (300 THB drop-in, 2,500 THB monthly), private 1-on-1 lessons (800 THB per 60-minute session), and the Fighter Program (9,500 THB per month). Group and private classes run at both Bo Phut and Plai Laem six days a week, with morning sessions at 9:00 and evening at 17:00. The Fighter Program runs at Plai Laem only.
          </p>
        </div>
      </section>

      <CTABanner
        title="Ready to Start?"
        description="Drop-in from 400 THB. No commitment, just show up and train."
        buttonText="Book Now"
        href="/booking"
        ghostText="View Pricing"
        ghostHref="/pricing"
      />
    </>
  );
}
