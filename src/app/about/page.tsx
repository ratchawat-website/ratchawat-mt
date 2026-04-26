import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import CTABanner from "@/components/ui/CTABanner";
import Image from "next/image";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import { Heart, Shield, Users, Star, Trophy } from "lucide-react";
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
    "Chor Ratchawat Muay Thai Gym is a family-run training camp in Koh Samui since 2020, with two locations in Bo Phut and Plai Laem. Fighters have competed at Rajadamnern Stadium, One Lumpinee, and RWS.",
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
            A family-run Muay Thai camp on Koh Samui since 2020. Two locations, ten Thai trainers, and a reputation built one student at a time.
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
                Ratchawat started in 2020 in Bo Phut. A small space, a handful of beginners, and two pairs of gloves. Kru Ratchawat had been training since he was a boy and wanted to teach the way he had learned: traditional Muay Thai, no shortcuts.
              </p>
              <p>
                Word got around. Travelers training for a week told friends. The gym filled up fast. When Bo Phut could not grow any more, Kru Ratchawat opened a second camp in Plai Laem near Big Buddha: a bigger space for fighters and a proper base to prepare them for the ring.
              </p>
              <p>
                Kru Ratchawat is passionate about Muay Thai and about passing on the culture the traditional way. Technique matters, but so does how you carry yourself. Respect and sportsmanship are not optional at the camp, inside the ring or outside.
              </p>
              <p>
                Today Ratchawat runs two camps with ten Thai trainers and fighters of all levels, from complete beginners to professionals. The gym is still family-run. Kru Ratchawat still teaches every day.
              </p>
            </div>
          </div>
          <div className="relative aspect-[9/16] rounded-card overflow-hidden">
            <Image
              src="/images/trainers/trainer-ratchawat-2.jpeg"
              alt="Kru Ratchawat, founder of Chor Ratchawat Muay Thai Gym"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Ring Results */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">RING RESULTS</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
            Our Fighters at Major Thai Stadiums
          </h2>
          <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed mb-6">
            <p>
              Ratchawat fighters have stepped into the ring at some of the most
              respected venues in Thailand. We prepare each athlete with a
              structured program, the right corner, and a fight schedule built
              around their level.
            </p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <li className="flex items-center gap-3 rounded-lg border-2 border-outline-variant bg-surface-lowest/60 px-4 py-3">
              <Trophy size={20} className="text-primary shrink-0" />
              <span className="text-on-surface font-semibold">Rajadamnern Stadium</span>
            </li>
            <li className="flex items-center gap-3 rounded-lg border-2 border-outline-variant bg-surface-lowest/60 px-4 py-3">
              <Trophy size={20} className="text-primary shrink-0" />
              <span className="text-on-surface font-semibold">One Lumpinee</span>
            </li>
            <li className="flex items-center gap-3 rounded-lg border-2 border-outline-variant bg-surface-lowest/60 px-4 py-3">
              <Trophy size={20} className="text-primary shrink-0" />
              <span className="text-on-surface font-semibold">RWS</span>
            </li>
          </ul>
          <p className="mt-6 text-on-surface-variant text-sm">
            Interested in fighting?{" "}
            <Link href="/programs/fighter" className="text-primary hover:text-primary-dim transition-colors font-medium">
              See the fighter program
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
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
            Chor Ratchawat Muay Thai Gym is a family-run training camp in Koh Samui, Thailand, founded in 2020 by Kru Ratchawat. Rated 5.0 out of 5 stars on Google with 396 reviews across its Bo Phut and Plai Laem camps. Our fighters have competed at Rajadamnern Stadium, One Lumpinee, and RWS. The gym welcomes all levels, from complete beginners to professional fighters.
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
