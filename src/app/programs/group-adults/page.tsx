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
import { Clock, Zap, Shield, Heart, Users, Target } from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Muay Thai Group Classes Koh Samui | All Levels - Ratchawat",
  description:
    "Join Muay Thai group classes at Ratchawat in Koh Samui. Morning & evening sessions, all levels welcome. Drop-in or book a weekly package.",
  path: "/programs/group-adults",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const groupClassCourse = courseSchema({
  name: "Muay Thai Group Classes for Adults",
  description:
    "Daily group Muay Thai classes at Ratchawat Koh Samui. Morning and evening sessions for all levels.",
  url: `${SITE_URL}/programs/group-adults`,
  offers: { price: 400, priceCurrency: "THB" },
});

const classStructure = [
  {
    icon: Heart,
    title: "Warm-up",
    time: "15 min",
    description: "Skipping rope, running, shadow boxing. Gets the body loose and ready.",
  },
  {
    icon: Target,
    title: "Technique",
    time: "30 min",
    description: "Punches, kicks, elbows, knees, clinch. Trainers demonstrate, you drill.",
  },
  {
    icon: Shield,
    title: "Pad Work",
    time: "20 min",
    description: "Rounds on the pads with a trainer. This is where you put combinations together.",
  },
  {
    icon: Zap,
    title: "Bag Work",
    time: "15 min",
    description: "Heavy bag rounds. Work on power, timing, and what you just learned.",
  },
  {
    icon: Users,
    title: "Partner Drills",
    time: "10 min",
    description: "Light sparring or clinch work with a partner. Optional, no pressure.",
  },
  {
    icon: Clock,
    title: "Cool-down",
    time: "10 min",
    description: "Stretching and core work. Leave the gym feeling worked but not wrecked.",
  },
];

export default function GroupAdultsPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), groupClassCourse]} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Programs", href: "/programs" },
          { label: "Group Classes", href: "/programs/group-adults" },
        ]}
      />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">GROUP TRAINING</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface">
            Muay Thai Group Classes for Adults
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Morning and evening sessions, Monday to Saturday. All levels. Drop-in or book a package.
          </p>
        </div>
      </section>

      {/* What to Expect */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">OVERVIEW</span><span className="w-8 h-[2px] bg-primary" /></div>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
              What to Expect
            </h2>
            <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
              <p>
                Group classes are the core of what we do at Ratchawat. You train alongside other students while trainers walk the room correcting form and holding pads.
              </p>
              <p>
                It does not matter if you have never thrown a kick before. Beginners and experienced fighters share the same session. Trainers adjust the intensity for each person.
              </p>
              <p>
                Expect to sweat. Each class runs about 90 minutes and covers striking technique, pad work, bag work, and conditioning. You will be tired by the end but you will learn something every session.
              </p>
            </div>
          </div>
          <div className="relative aspect-[9/16] rounded-card overflow-hidden">
            <Image
              src="/images/programs/group-adult.jpg"
              alt="Adults group Muay Thai class at Ratchawat camp"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Class Structure */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">SESSION BREAKDOWN</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            Class Structure
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classStructure.map((item, i) => (
              <GlassCard key={item.title} number={String(i + 1).padStart(2, "0")}>
                <div className="flex items-center gap-3 mb-3">
                  <item.icon size={24} className="text-primary" />
                  <span className="badge-underline badge-neutral">
                    {item.time}
                  </span>
                </div>
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

      {/* Schedule & Pricing */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">SCHEDULE</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
            Schedule & Pricing
          </h2>
          <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              Group classes run at 9:00 AM and 5:00 PM, Monday through Saturday. Sunday is rest day. Check the full timetable on the{" "}
              <Link href="/camps/bo-phut#schedule" className="text-primary hover:text-primary-dim transition-colors font-medium">Bo Phut</Link>
              {" "}or{" "}
              <Link href="/camps/plai-laem#schedule" className="text-primary hover:text-primary-dim transition-colors font-medium">Plai Laem</Link>
              {" "}camp pages.
            </p>
            <p>
              Drop-in: 400 THB per session. Weekly packages from 2,000 THB.{" "}
              <Link href="/pricing" className="text-primary hover:text-primary-dim transition-colors font-medium">See full pricing</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Ratchawat&apos;s adult group Muay Thai classes in Koh Samui run daily with morning and evening sessions. Classes are open to all levels, from complete beginners to experienced fighters. Each session includes warm-up, technique drills, pad work, and conditioning. Drop-in available at 400 THB per session.
          </p>
        </div>
      </section>

      <CTABanner
        title="Try a Group Class"
        description="400 THB drop-in. No booking required, just show up."
        buttonText="Book Now"
        href="/booking/training?package=drop-in-adult"
        ghostText="View Pricing"
        ghostHref="/pricing"
      />
    </>
  );
}
