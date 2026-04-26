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
import { Shield, Heart, Trophy, Brain, Smile, Users } from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Kids Muay Thai Classes Koh Samui | Safe & Fun - Ratchawat",
  description:
    "Kids Muay Thai at Ratchawat Koh Samui. Safe, structured classes for children. Build confidence, discipline & fitness. Family-friendly gym.",
  path: "/programs/group-kids",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const kidsCourse = courseSchema({
  name: "Kids Muay Thai Classes",
  description:
    "Specialized Muay Thai classes for children at Ratchawat Koh Samui. Focused on fundamentals, discipline, and confidence.",
  url: `${SITE_URL}/programs/group-kids`,
  offers: { price: 300, priceCurrency: "THB" },
});

const benefits = [
  {
    icon: Shield,
    title: "Safety First",
    description: "No hard sparring. Trainers watch every drill and pair kids by size and experience.",
  },
  {
    icon: Brain,
    title: "Discipline",
    description: "Structure, respect, and focus. Kids learn to listen, wait their turn, and push through.",
  },
  {
    icon: Heart,
    title: "Fitness",
    description: "Running, jumping, kicking. A full-body workout that beats sitting on a screen.",
  },
  {
    icon: Smile,
    title: "Confidence",
    description: "Learning to punch and kick properly does something for a kid. They stand taller.",
  },
  {
    icon: Trophy,
    title: "Competition (Optional)",
    description: "Several Ratchawat kids have won local tournaments. Not required, but the option is there.",
  },
  {
    icon: Users,
    title: "Family Friendly",
    description: "Parents often train in the adult class next door. Some families make it a daily routine.",
  },
];

export default function GroupKidsPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), kidsCourse]} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Programs", href: "/programs" },
          { label: "Kids Classes" },
        ]}
      />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">KIDS PROGRAM</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface">
            Kids Muay Thai Classes
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Group classes for ages 8 to 13. Younger kids (3 to 7) train through private sessions. Safe, structured, and actually fun. No experience needed.
          </p>
        </div>
      </section>

      {/* About the Program */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">OVERVIEW</span><span className="w-8 h-[2px] bg-primary" /></div>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
              The Program
            </h2>
            <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
              <p>
                Kids classes at Ratchawat focus on Muay Thai basics: stance, movement, punches, kicks. But the real point is getting children active, teaching them to respect the gym and each other, and giving them something to be proud of.
              </p>
              <p>
                Classes run for about an hour. Trainers keep the energy up with games and drills that feel more like playing than training. The technique work sneaks in between.
              </p>
              <p>
                Some of our youngest students have gone on to compete in local tournaments on Koh Samui. That is not the goal for everyone, but it is there if a child wants it.
              </p>
            </div>
          </div>
          <div className="relative aspect-[9/16] rounded-card overflow-hidden">
            <Image
              src="/images/programs/groupf-kids.jpg"
              alt="Kids Muay Thai class at Ratchawat camp"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">BENEFITS</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            What Kids Get Out of It
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((item, i) => (
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

      {/* Info for Parents */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">PARENTS</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
            For Parents
          </h2>
          <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              You are welcome to watch from the side or train in the adult session running at the same time. Many families do both.
            </p>
            <p>
              No gear needed to start. Gloves and shin guards are available at the gym. If your child sticks with it, their own pair of gloves makes a good souvenir.
            </p>
            <p>
              Drop-in: 300 THB per session. Monthly unlimited: 2,500 THB. See{" "}
              <Link href="/pricing" className="text-primary hover:text-primary-dim transition-colors font-medium">pricing</Link>
              {" "}for weekly and monthly rates. Questions?{" "}
              <Link href="/contact" className="text-primary hover:text-primary-dim transition-colors font-medium">Get in touch</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Chor Ratchawat Muay Thai in Koh Samui runs kids classes at both Bo Phut and Plai Laem camps. Group sessions are open to ages 8 to 13 at 300 THB drop-in or 2,500 THB monthly unlimited. Younger children (ages 3 to 7) train through 1-on-1 or small-group private lessons (max 3 kids). Classes cover Muay Thai basics, fitness, and gym discipline. Several young Ratchawat students have won local Koh Samui competitions.
          </p>
        </div>
      </section>

      <CTABanner
        title="Bring the Kids"
        description="Drop-in 300 THB. Monthly unlimited 2,500 THB. Ages 8-13."
        buttonText="Book Now"
        href="/booking/training?package=drop-in-kids"
        ghostText="View Pricing"
        ghostHref="/pricing"
      />
    </>
  );
}
