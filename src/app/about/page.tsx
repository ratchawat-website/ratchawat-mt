import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import CTABanner from "@/components/ui/CTABanner";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import { Heart, Shield, Users, Star } from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "About Chor Ratchawat Muay Thai Gym | Koh Samui",
  description:
    "Learn about Chor Ratchawat Muay Thai, a family-run camp in Koh Samui. Meet our trainers, discover our story, and see why we are rated 5.0/5 on Google.",
  path: "/about",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Chor Ratchawat Muay Thai",
  url: `${SITE_URL}/about`,
  description:
    "Chor Ratchawat Muay Thai Gym is a family-run training camp in Koh Samui with two locations in Bo Phut and Plai Laem.",
};

const values = [
  {
    icon: Heart,
    title: "Family First",
    description:
      "Ratchawat is run by a family. That shows in how we treat people. Beginners get the same attention as experienced fighters. Kids train alongside adults. Everyone is welcome.",
  },
  {
    icon: Shield,
    title: "Real Muay Thai",
    description:
      "No fitness boxing, no cardio kickboxing. We teach Muay Thai the way it is taught in Thailand. Technique, tradition, and respect for the art.",
  },
  {
    icon: Users,
    title: "For Everyone",
    description:
      "We train tourists on vacation, expats living on the island, kids after school, and fighters preparing for bouts. The gym adapts to you, not the other way around.",
  },
  {
    icon: Star,
    title: "Reputation Earned",
    description:
      "5.0 out of 5 stars on Google, with 396 reviews across our two camps. We did not get there through marketing. Students leave, write something honest, and others read it.",
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), aboutPageSchema]} />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-on-surface">
            About Chor Ratchawat Muay Thai
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            A family-run Muay Thai camp on Koh Samui. Two locations, a dozen trainers, and a reputation built one student at a time.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">OUR STORY</span><span className="w-8 h-[2px] bg-primary" /></div>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
              <p>
                Ratchawat started in Bo Phut. A small gym on Soi Sunday, a few bags, a ring, and a trainer named Kruu Wat who wanted to teach Muay Thai the right way. No shortcuts, no gimmicks.
              </p>
              <p>
                Word got around. Travelers training for a week told friends. Fighters came to prepare for bouts. Families brought their kids. The gym filled up, so a second location opened in Plai Laem, near Big Buddha. Bigger space, same approach.
              </p>
              <p>
                Today Ratchawat runs two camps with a dozen trainers. The gym is still family-run. Kruu Wat still teaches every day. The philosophy has not changed: train hard, treat people well, keep it real.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <ImagePlaceholder category="team" aspectRatio="aspect-video" />
            <ImagePlaceholder category="gym" aspectRatio="aspect-video" />
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">WHAT WE STAND FOR</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            Our Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((item, i) => (
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

      {/* Why Students Choose Us */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">WHY US</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
            Why Students Choose Us
          </h2>
          <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              Koh Samui has dozens of Muay Thai gyms. Most cater to tourists. A few focus on fighters. Ratchawat does both, without compromising on either.
            </p>
            <p>
              The trainers speak English and teach in a way that works for people who have never thrown a punch. At the same time, they have the experience to prepare fighters for the ring. That range is rare.
            </p>
            <p>
              Two locations means you can pick what suits you.{" "}
              <Link href="/camps/bo-phut" className="text-primary hover:text-primary-dim transition-colors font-medium">Bo Phut</Link>
              {" "}is small and street-level.{" "}
              <Link href="/camps/plai-laem" className="text-primary hover:text-primary-dim transition-colors font-medium">Plai Laem</Link>
              {" "}is bigger with a bodyweight area. Same trainers at both.
            </p>
          </div>
        </div>
      </section>

      {/* Reputation */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">REPUTATION</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
            Our Reputation
          </h2>
          <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              Ratchawat holds a 5.0 out of 5 star rating on Google at both camps. Bo Phut has 255 reviews. Plai Laem has 141 reviews. That adds up to 396 verified reviews with a perfect average.
            </p>
            <p>
              The gym is listed as beginner-friendly, female-friendly, and kid-friendly with English-speaking trainers. Read what students have written on our{" "}
              <Link href="/reviews" className="text-primary hover:text-primary-dim transition-colors font-medium">reviews page</Link>.
            </p>
            <p>
              Want to know the people behind those scores? Meet the{" "}
              <Link href="/team" className="text-primary hover:text-primary-dim transition-colors font-medium">trainers</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Chor Ratchawat Muay Thai Gym is a family-run training camp in Koh Samui, Thailand, rated 5.0 out of 5 stars on Google with 396 reviews across its Bo Phut and Plai Laem camps. The gym is known for its welcoming atmosphere, qualified Thai trainers, and programs for all levels from complete beginners to professional fighters.
          </p>
        </div>
      </section>

      <CTABanner
        title="Come Train With Us"
        description="Drop-in from 400 THB. Two camps, all levels, six days a week."
        buttonText="Book Now"
        href="/booking"
        ghostText="View Pricing"
        ghostHref="/pricing"
      />
    </>
  );
}
