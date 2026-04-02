import { generatePageMeta } from "@/lib/seo/meta";
import HeroSection from "@/components/ui/HeroSection";
import GlassCard from "@/components/ui/GlassCard";
import CTABanner from "@/components/ui/CTABanner";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/components/seo/SchemaOrg";
import { Star, MapPin, Users, FileCheck } from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Muay Thai Camp Koh Samui | Chor Ratchawat - Bo Phut & Plai Laem",
  description:
    "Train Muay Thai at Chor Ratchawat Gym in Koh Samui. Two locations in Bo Phut & Plai Laem. Group, private & kids classes. Book online today.",
  path: "/",
});

const features = [
  {
    icon: Star,
    title: "Rating 9.3/10",
    description:
      "Consistently top-rated Muay Thai camp on Koh Samui with verified reviews from fighters worldwide.",
  },
  {
    icon: MapPin,
    title: "Two Locations",
    description:
      "Train at Bo Phut or Plai Laem. Both camps offer full equipment, ring access, and experienced trainers.",
  },
  {
    icon: Users,
    title: "All Levels Welcome",
    description:
      "From your first session to professional fight prep. Our trainers adapt every class to your skill level.",
  },
  {
    icon: FileCheck,
    title: "Visa Support",
    description:
      "Long-stay training? We provide documentation to support your ED visa application for extended training stays.",
  },
];

const programs = [
  {
    title: "Group Training",
    description:
      "Morning and afternoon sessions with pad work, bag work, clinching, and conditioning.",
    href: "/programs/group",
  },
  {
    title: "Private Lessons",
    description:
      "One-on-one sessions with our top trainers tailored to your goals and experience.",
    href: "/programs/private",
  },
  {
    title: "Kids Program",
    description:
      "Safe, fun classes for children aged 5-15 focused on discipline, fitness, and fundamentals.",
    href: "/programs/kids",
  },
  {
    title: "Fighter Program",
    description:
      "Intensive camp for those preparing for amateur or professional fights in Thailand.",
    href: "/programs/fighter",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema()]} />

      <HeroSection
        title="RATCHAWAT MUAY THAI"
        subtitle="Train at the heart of Koh Samui. Two camps. All levels."
        ctaText="Book Your Training"
        ctaHref="/booking"
      />

      {/* Why Train With Us */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface uppercase text-center mb-12">
            Why Train With Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <GlassCard key={feature.title}>
                <feature.icon
                  className="w-8 h-8 text-primary mb-4"
                  strokeWidth={1.5}
                />
                <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                  {feature.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Training Programs */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface uppercase text-center mb-12">
            Training Programs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {programs.map((program) => (
              <Link key={program.title} href={program.href} className="group">
                <GlassCard>
                  <h3 className="font-serif text-xl font-bold text-on-surface uppercase mb-2 group-hover:text-primary transition-colors">
                    {program.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    {program.description}
                  </p>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed text-center">
            Chor Ratchawat Muay Thai is a family-run training camp on Koh Samui,
            Thailand, with two locations in Bo Phut and Plai Laem. Founded by
            Chor Ratchawat, the gym offers group classes, private one-on-one
            lessons, a dedicated kids program, and an intensive fighter
            preparation camp. Training is available for all experience levels
            from complete beginners to professional fighters. The camp holds a
            9.3 out of 10 rating and provides visa support documentation for
            long-stay students. Sessions run daily with morning and afternoon
            schedules. Online booking and payments are accepted via the website.
          </p>
        </div>
      </section>

      <CTABanner
        title="Ready to Train?"
        description="Book your first session at Ratchawat Koh Samui"
        buttonText="Book Now"
        href="/booking"
      />
    </>
  );
}
