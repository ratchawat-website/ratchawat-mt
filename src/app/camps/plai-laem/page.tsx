import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import HeroSection from "@/components/ui/HeroSection";
import GlassCard from "@/components/ui/GlassCard";
import CTABanner from "@/components/ui/CTABanner";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import ScheduleTable from "@/components/ui/ScheduleTable";
import LocationCard from "@/components/ui/LocationCard";
import JsonLd from "@/components/seo/JsonLd";
import {
  organizationSchema,
  sportsActivityLocationSchema,
} from "@/components/seo/SchemaOrg";
import {
  Dumbbell,
  Shield,
  Target,
  Heart,
  Users,
  Timer,
  Flame,
  StretchHorizontal,
} from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Muay Thai Plai Laem Koh Samui | Ratchawat \u2014 Full Gym & Bodyweight",
  description:
    "Train Muay Thai at Ratchawat Plai Laem, Koh Samui. Full gym with bodyweight area. Group & private classes daily. Near Big Buddha.",
  path: "/camps/plai-laem",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const plaiLaemLocation = sportsActivityLocationSchema({
  name: "Chor Ratchawat Muay Thai Gym - Plai Laem",
  description:
    "Muay Thai training camp in Plai Laem, Koh Samui. Full gym with bodyweight area, group and private classes near Big Buddha.",
  address: {
    streetAddress: "20/33 Moo 5, Plai Laem Soi 13, Tambon Bo Put",
    addressLocality: "Ko Samui",
    addressRegion: "Surat Thani",
    postalCode: "84320",
    addressCountry: "TH",
  },
  geo: { latitude: 9.5718233, longitude: 100.0725812 },
  telephone: "+66630802876",
  url: `${SITE_URL}/camps/plai-laem`,
  openingHours: [
    "Mo-Fr 08:00-20:00",
    "Sa 08:00-12:00",
  ],
});

const schedule = [
  {
    time: "8:00",
    duration: "8:00 - 9:00 (1 hour)",
    type: "private" as const,
    label: "Private Lesson",
  },
  {
    time: "9:30",
    duration: "9:30 - 10:30 (1 hour)",
    type: "group" as const,
    label: "Group Class",
  },
  {
    time: "11:00",
    duration: "11:00 - 17:00 (by appointment)",
    type: "private" as const,
    label: "Private Lessons",
  },
  {
    time: "17:00",
    duration: "17:00 - 18:30 (1.5 hours)",
    type: "group" as const,
    label: "Group Class",
  },
];

const equipment = [
  {
    icon: Target,
    name: "Boxing Ring",
    description: "Full-size ring for sparring, clinch work, and pad sessions",
  },
  {
    icon: Dumbbell,
    name: "Heavy Bags",
    description: "Multiple heavy bags and banana bags for all striking drills",
  },
  {
    icon: Shield,
    name: "Thai Pads & Focus Mitts",
    description: "Quality pads for technique training with experienced trainers",
  },
  {
    icon: StretchHorizontal,
    name: "Bodyweight Area",
    description: "Pull-up bars, dip bars, and space for calisthenics and conditioning",
  },
  {
    icon: Flame,
    name: "Cardio Zone",
    description: "Skipping ropes, battle ropes, and open floor for circuits",
  },
  {
    icon: Heart,
    name: "Shin Guards & Gloves",
    description: "Gear available for rent if you travel light",
  },
  {
    icon: Timer,
    name: "Timer System",
    description: "Round timers throughout the gym for structured training sessions",
  },
  {
    icon: Users,
    name: "Spacious Training Floor",
    description: "Larger layout with room for multiple groups training at the same time",
  },
];

export default function PlaiLaemCampPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), plaiLaemLocation]} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Camps" },
          { label: "Plai Laem" },
        ]}
      />

      {/* Hero */}
      <HeroSection
        kicker="Plai Laem, Koh Samui"
        title="RATCHAWAT"
        titleLine2="PLAI LAEM"
        subtitle="Full gym and bodyweight training near Big Buddha, Koh Samui"
        ctaText="Book a Session"
        ctaHref="/booking"
        ghostText="View Pricing"
        ghostHref="/pricing"
      />

      {/* The Gym */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">OUR SPACE</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            The Gym
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed mb-4">
                Plai Laem is the newer, bigger Ratchawat location. More room to work, in a quiet area near Big Buddha temple. Same trainers, same coaching, just more space.
              </p>
              <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed mb-4">
                There is a full Muay Thai training area with a ring, heavy bags, and pads, plus a bodyweight section with pull-up bars, dip bars, and open floor. Good for anyone who wants to mix striking with strength and conditioning work.
              </p>
              <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed">
                Want something smaller? Our original{" "}
                <Link
                  href="/camps/bo-phut"
                  className="text-primary hover:text-primary-dim transition-colors font-medium"
                >
                  Bo Phut camp
                </Link>{" "}
                near Fisherman&apos;s Village has that covered.
              </p>
            </div>
            <div className="space-y-4">
              <ImagePlaceholder category="gym" aspectRatio="aspect-video" />
              <div className="grid grid-cols-2 gap-4">
                <ImagePlaceholder category="gym" aspectRatio="aspect-square" />
                <ImagePlaceholder category="training" aspectRatio="aspect-square" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">TIMETABLE</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-4">
            Schedule
          </h2>
          <p className="text-on-surface-variant text-base sm:text-lg mb-8">
            Classes run Monday to Saturday. Sunday is rest day. Drop-in sessions start at 400 THB.{" "}
            <Link
              href="/pricing"
              className="text-primary hover:text-primary-dim transition-colors font-medium"
            >
              See full pricing
            </Link>
            .
          </p>
          <ScheduleTable schedule={schedule} />
          <p className="mt-6 text-on-surface-variant text-sm">
            Private lessons can be booked outside group class hours. The bodyweight area is open during all gym hours.
          </p>
        </div>
      </section>

      {/* Equipment & Facilities */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">GEAR</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            Equipment & Facilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {equipment.map((item, i) => (
              <GlassCard key={item.name} number={String(i + 1).padStart(2, "0")}>
                <item.icon size={28} className="text-primary mb-3" />
                <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                  {item.name}
                </h3>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  {item.description}
                </p>
              </GlassCard>
            ))}
          </div>
          <p className="mt-8 text-on-surface-variant text-base">
            All equipment is shared across our{" "}
            <Link
              href="/programs"
              className="text-primary hover:text-primary-dim transition-colors font-medium"
            >
              training programs
            </Link>
            : group classes, private lessons, kids sessions, and fighter training.
          </p>
        </div>
      </section>

      {/* How to Get Here */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">DIRECTIONS</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            How to Get Here
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed mb-4">
                We are on Plai Laem Soi 13, northeast Koh Samui. Big Buddha temple is about 5 minutes by scooter. Quieter than the tourist centers.
              </p>
              <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed mb-4">
                Scooter rentals (from 200 THB/day) are everywhere. Grab and songthaew (shared taxis) reach this area too.
              </p>
              <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed">
                Looking for a place to stay? See our{" "}
                <Link
                  href="/accommodation"
                  className="text-primary hover:text-primary-dim transition-colors font-medium"
                >
                  accommodation options
                </Link>{" "}
                near the Plai Laem camp.
              </p>
            </div>
            <LocationCard
              name="Ratchawat Plai Laem"
              address="20, 33 หมู่ที่ 5 ปลายแหลม ซอย 13, Tambon Bo Put, Amphoe Ko Samui, Surat Thani 84320"
              phone="+66 63 080 2876"
              email="chor.ratchawat@gmail.com"
              hours="8:00 AM - 8:00 PM, 6 days/week"
              mapEmbedUrl="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1966!2d100.0725812!3d9.5718233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMzQnMTguNiJOIDEwMMKwMDQnMjEuMyJF!5e0!3m2!1sen!2sth!4v1"
            />
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Ratchawat Muay Thai Plai Laem is the newer, larger location in Koh Samui, near Big Buddha. The facility features a full Muay Thai training area plus a bodyweight section. Daily group and private classes run from 8 AM to 8 PM. Address: 20, 33 หมู่ที่ 5 ปลายแหลม ซอย 13, Tambon Bo Put, Amphoe Ko Samui, Surat Thani 84320.
          </p>
        </div>
      </section>

      <CTABanner
        title="Ready to Train at Plai Laem?"
        description="Drop-in from 400 THB. No commitment, just show up and train."
        buttonText="Book Now"
        href="/booking"
        ghostText="View Pricing"
        ghostHref="/pricing"
      />
    </>
  );
}
