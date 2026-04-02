import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import CTABanner from "@/components/ui/CTABanner";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import JsonLd from "@/components/seo/JsonLd";
import {
  organizationSchema,
  courseSchema,
} from "@/components/seo/SchemaOrg";
import { Swords, Zap, Brain, Timer, Dumbbell, Shield } from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Fighter Program Koh Samui | Train to Fight \u2014 Ratchawat Muay Thai",
  description:
    "Intensive Muay Thai fighter program at Ratchawat Koh Samui. Fight preparation, sparring, conditioning. For serious athletes ready to compete.",
  path: "/programs/fighter",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const fighterCourse = courseSchema({
  name: "Fighter Training Program",
  description:
    "Intensive Muay Thai fighter program at Ratchawat Koh Samui for athletes preparing to compete.",
  url: `${SITE_URL}/programs/fighter`,
});

const trainingBlocks = [
  {
    icon: Timer,
    title: "Morning Session",
    time: "8:00 AM",
    description: "Running, shadow boxing, technique drills, pad work. The technical session.",
  },
  {
    icon: Dumbbell,
    title: "Strength & Conditioning",
    time: "10:00 AM",
    description: "Bodyweight circuits, core work, bag rounds. Building the engine.",
  },
  {
    icon: Swords,
    title: "Afternoon Session",
    time: "4:00 PM",
    description: "Sparring, clinch work, fight strategy. Putting it all together under pressure.",
  },
  {
    icon: Zap,
    title: "Evening Session",
    time: "6:00 PM",
    description: "Pad work with a trainer, extra rounds, and conditioning finishers.",
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
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-on-surface">
            Fighter Training Program
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            For athletes who want to compete. Two to three sessions a day, six days a week.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-on-surface mb-6">
              The Program
            </h2>
            <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
              <p>
                The fighter program is how Ratchawat trains people who want to step into the ring. It is not a course you sign up for, it is a commitment. Two or three sessions a day, six days a week, for as long as you are here.
              </p>
              <p>
                Mornings focus on technique and pad work. Afternoons are for sparring and clinch. In between, there is conditioning. Trainers build your program around your fight date if you have one, or work with you to get ring-ready if you do not.
              </p>
              <p>
                Past fighters from Ratchawat have competed in local Koh Samui shows and regional events across southern Thailand. Some came in with years of experience. Others built up from scratch over a few months.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <ImagePlaceholder category="training" aspectRatio="aspect-video" />
            <ImagePlaceholder category="gym" aspectRatio="aspect-video" />
          </div>
        </div>
      </section>

      {/* Training Schedule */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-on-surface mb-8">
            Typical Training Day
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainingBlocks.map((block) => (
              <GlassCard key={block.title}>
                <div className="flex items-center gap-3 mb-3">
                  <block.icon size={24} className="text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    {block.time}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                  {block.title}
                </h3>
                <p className="text-on-surface-variant text-sm">
                  {block.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Prerequisites */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-on-surface mb-8">
            What You Need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {whatYouNeed.map((item) => (
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

      {/* Pricing & Stay */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-on-surface mb-6">
            Pricing & Accommodation
          </h2>
          <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              Fighter training uses the monthly membership at 5,500 THB, which covers all sessions.{" "}
              <Link href="/pricing" className="text-primary hover:text-primary-dim transition-colors font-medium">See full pricing</Link>.
            </p>
            <p>
              Most fighters stay for at least a month. We work with nearby{" "}
              <Link href="/accommodation" className="text-primary hover:text-primary-dim transition-colors font-medium">accommodation options</Link>
              {" "}so you can focus on training.
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
            Ratchawat&apos;s fighter program in Koh Samui is an intensive training camp for athletes preparing for Muay Thai competition. The program includes technique refinement, sparring, conditioning, and fight strategy with experienced Thai trainers. Past students have won local and regional competitions.
          </p>
        </div>
      </section>

      <CTABanner
        title="Ready to Fight?"
        description="Monthly membership 5,500 THB. All sessions included."
        buttonText="Book Now"
        href="/booking"
      />
    </>
  );
}
