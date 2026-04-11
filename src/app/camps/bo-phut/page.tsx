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
} from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Muay Thai Bo Phut Koh Samui | Ratchawat \u2014 Street Gym Vibes",
  description:
    "Train Muay Thai at Ratchawat Bo Phut, near Fisherman's Village, Koh Samui. Intimate gym with authentic street atmosphere. Daily schedule & classes.",
  path: "/camps/bo-phut",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const boPhutLocation = sportsActivityLocationSchema({
  name: "Chor Ratchawat Muay Thai Gym - Bo Phut",
  description:
    "Muay Thai training camp in Bo Phut, Koh Samui. Intimate street gym near Fisherman's Village with group classes, private lessons, and kids programs.",
  address: {
    streetAddress: "Soi Sunday, Tambon Bo Put",
    addressLocality: "Ko Samui",
    addressRegion: "Surat Thani",
    postalCode: "84320",
    addressCountry: "TH",
  },
  geo: { latitude: 9.5553391, longitude: 100.0344246 },
  telephone: "+66630802876",
  url: `${SITE_URL}/camps/bo-phut`,
  openingHours: [
    "Mo-Fr 08:00-20:00",
    "Sa 08:00-12:00",
  ],
});

const schedule = [
  {
    time: "8:00 AM",
    monday: "Group Class",
    tuesday: "Group Class",
    wednesday: "Group Class",
    thursday: "Group Class",
    friday: "Group Class",
    saturday: "Group Class",
  },
  {
    time: "10:00 AM",
    monday: "Private Lessons",
    tuesday: "Private Lessons",
    wednesday: "Private Lessons",
    thursday: "Private Lessons",
    friday: "Private Lessons",
    saturday: "Private Lessons",
  },
  {
    time: "4:00 PM",
    monday: "Group Class",
    tuesday: "Group Class",
    wednesday: "Group Class",
    thursday: "Group Class",
    friday: "Group Class",
  },
  {
    time: "6:00 PM",
    monday: "Group Class",
    tuesday: "Group Class",
    wednesday: "Group Class",
    thursday: "Group Class",
    friday: "Group Class",
  },
];

const equipment = [
  {
    icon: Target,
    name: "Boxing Ring",
    description: "Full-size ring for sparring and pad work",
  },
  {
    icon: Dumbbell,
    name: "Heavy Bags",
    description: "Multiple heavy bags for striking drills",
  },
  {
    icon: Shield,
    name: "Thai Pads & Focus Mitts",
    description: "Quality pads for technique training with trainers",
  },
  {
    icon: Timer,
    name: "Skipping Ropes",
    description: "Ropes for warm-up and cardio conditioning",
  },
  {
    icon: Heart,
    name: "Shin Guards & Gloves",
    description: "Gear available for rent if you travel light",
  },
  {
    icon: Users,
    name: "Open Training Area",
    description: "Space for shadow boxing, stretching, and conditioning",
  },
];

export default function BoPhutCampPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), boPhutLocation]} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Camps" },
          { label: "Bo Phut" },
        ]}
      />

      {/* Hero */}
      <HeroSection
        kicker="Bo Phut, Koh Samui"
        title="RATCHAWAT"
        titleLine2="BO PHUT"
        subtitle="Street gym vibes near Fisherman's Village, Koh Samui"
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
                Bo Phut is where Ratchawat started. The original camp, on Soi Sunday, a short walk from Fisherman&apos;s Village. The gym is small on purpose. You train next to the trainers, next to other fighters, practically on the street.
              </p>
              <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed mb-4">
                No fancy machines, no air conditioning. A ring, bags, pads, and trainers who grew up fighting. It feels like a real Thai gym because it is one.
              </p>
              <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed">
                Beginners and experienced fighters train here side by side. Families too. If you want a bigger space with more equipment, check out our{" "}
                <Link
                  href="/camps/plai-laem"
                  className="text-primary hover:text-primary-dim transition-colors font-medium"
                >
                  Plai Laem camp
                </Link>
                .
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
            Private lessons can be booked outside group class hours. Contact us to arrange a time that works for you.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            See all our{" "}
            <Link
              href="/programs"
              className="text-primary hover:text-primary-dim transition-colors font-medium"
            >
              training programs
            </Link>
            : group classes, private 1-on-1 lessons, kids sessions, and fighter training.
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
                We are on Soi Sunday, a quiet side street in Bo Phut. Fisherman&apos;s Village and the Walking Street are about 5 minutes by scooter.
              </p>
              <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed mb-4">
                Most students get around by scooter (rentals from 200 THB/day are everywhere on the island). Songthaew (shared taxis) and Grab are also easy options.
              </p>
              <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed">
                Need a place to stay nearby? Check our{" "}
                <Link
                  href="/accommodation"
                  className="text-primary hover:text-primary-dim transition-colors font-medium"
                >
                  accommodation options
                </Link>{" "}
                including our partner hostel in Bo Phut.
              </p>
            </div>
            <LocationCard
              name="Ratchawat Bo Phut"
              address="Soi Sunday, Tambon Bo Put, Ko Samui District, Surat Thani 84320"
              phone="+66 63 080 2876"
              email="chor.ratchawat@gmail.com"
              hours="8:00 AM - 8:00 PM, 6 days/week"
              mapEmbedUrl="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3933!2d100.0344246!3d9.5553391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMzMnMTkuMiJOIDEwMMKwMDInMDQuMCJF!5e0!3m2!1sen!2sth!4v1"
              campPageHref="/camps/bo-phut"
            />
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Ratchawat Muay Thai Bo Phut is located on Soi Sunday in Bo Phut, near Fisherman&apos;s Village, Koh Samui. It is a small, intimate gym with an authentic street atmosphere and family vibes. The gym offers group and private Muay Thai classes 6 days a week, 8 AM to 8 PM. Address: Soi Sunday, Tambon Bo Put, Ko Samui District, Surat Thani 84320.
          </p>
        </div>
      </section>

      <CTABanner
        title="Ready to Train at Bo Phut?"
        description="Drop-in from 400 THB. No commitment, just show up and train."
        buttonText="Book Now"
        href="/booking"
        ghostText="View Pricing"
        ghostHref="/pricing"
      />
    </>
  );
}
