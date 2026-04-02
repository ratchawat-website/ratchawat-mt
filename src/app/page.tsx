import { generatePageMeta } from "@/lib/seo/meta";
import HeroSection from "@/components/ui/HeroSection";
import GlassCard from "@/components/ui/GlassCard";
import CTABanner from "@/components/ui/CTABanner";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import JsonLd from "@/components/seo/JsonLd";
import {
  organizationSchema,
  websiteSchema,
  aggregateRatingSchema,
} from "@/components/seo/SchemaOrg";
import {
  Star,
  MapPin,
  Users,
  FileCheck,
  DollarSign,
  ArrowRight,
  Quote,
} from "lucide-react";
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
      "Long-stay training? We provide documentation for DTV visa (180 days) and ED visa (90 days) applications.",
  },
];

const programs = [
  {
    title: "Group Training",
    description:
      "Morning and afternoon sessions with pad work, bag work, clinching, and conditioning.",
    href: "/programs/group-adults",
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
    href: "/programs/group-kids",
  },
  {
    title: "Fighter Program",
    description:
      "Intensive camp for those preparing for amateur or professional fights in Thailand.",
    href: "/programs/fighter",
  },
];

const camps = [
  {
    name: "Bo Phut",
    description:
      "Our original street gym near Fisherman's Village. Small, intimate, and full of family energy. Perfect for those who want authentic Thai training in a close-knit atmosphere.",
    href: "/camps/bo-phut",
  },
  {
    name: "Plai Laem",
    description:
      "A larger space near Big Buddha with a dedicated bodyweight training area. More room, more equipment, same Ratchawat spirit. Ideal for serious sessions.",
    href: "/camps/plai-laem",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    country: "Australia",
    rating: 5,
    text: "Best Muay Thai experience in Thailand. Kroo Wat and the team made me feel welcome from day one. I came for a week and stayed for a month.",
  },
  {
    name: "Thomas L.",
    country: "France",
    rating: 5,
    text: "Fantastic gym with real Thai trainers who care about your technique. The vibe is friendly, no ego. Both locations are great but I prefer Bo Phut for the street feel.",
  },
  {
    name: "James K.",
    country: "UK",
    rating: 5,
    text: "Trained here for 3 months on a DTV visa. Went from complete beginner to confident in the ring. The fighter program is tough but the trainers push you the right way.",
  },
];

const trainers = [
  { name: "Kroo Wat", role: "Head Trainer" },
  { name: "Mam", role: "Trainer" },
  { name: "Kong", role: "Trainer" },
  { name: "Teacher Nangja", role: "Kids Instructor" },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          websiteSchema(),
          aggregateRatingSchema({ ratingValue: 9.3, reviewCount: 131 }),
        ]}
      />

      <HeroSection
        title="RATCHAWAT MUAY THAI"
        subtitle="Train at the heart of Koh Samui. Two camps. All levels."
        ctaText="Book Your Training"
        ctaHref="/booking"
      />

      {/* Why Train at Ratchawat */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface uppercase text-center mb-12">
            Why Train at Ratchawat
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

      {/* Our Two Camps */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface uppercase text-center mb-12">
            Our Two Camps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {camps.map((camp) => (
              <Link key={camp.name} href={camp.href} className="group">
                <GlassCard>
                  <ImagePlaceholder
                    category="gym"
                    aspectRatio="aspect-[4/3]"
                    className="mb-6"
                  />
                  <h3 className="font-serif text-xl font-bold text-on-surface uppercase mb-3 group-hover:text-primary transition-colors">
                    {camp.name}
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
                    {camp.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold">
                    Explore {camp.name}{" "}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Training Programs */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
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
          <div className="text-center mt-8">
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dim transition-colors"
            >
              View all programs <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto">
          <GlassCard>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-primary shrink-0" strokeWidth={1.5} />
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-on-surface uppercase">
                    Training Prices
                  </h2>
                  <p className="text-on-surface-variant text-sm mt-1">
                    Affordable training for every budget
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                <div className="text-center">
                  <span className="font-serif text-3xl font-bold text-primary">
                    500 THB
                  </span>
                  <p className="text-on-surface-variant text-xs mt-1">
                    Drop-in (~$15 USD)
                  </p>
                </div>
                <div className="text-center">
                  <span className="font-serif text-3xl font-bold text-primary">
                    5,500 THB
                  </span>
                  <p className="text-on-surface-variant text-xs mt-1">
                    Monthly (~$167 USD)
                  </p>
                </div>
              </div>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 bg-primary text-on-primary font-semibold px-6 py-3 rounded-[0.5rem] hover:bg-primary-dim transition-colors text-sm shrink-0"
              >
                View All Prices <ArrowRight size={16} />
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* What Our Students Say */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface uppercase text-center mb-4">
            What Our Students Say
          </h2>
          <p className="text-on-surface-variant text-center mb-12">
            9.3/10 average rating from 131 Google reviews
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <GlassCard key={testimonial.name}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-primary fill-primary"
                    />
                  ))}
                </div>
                <Quote
                  size={20}
                  className="text-primary/30 mb-2"
                  strokeWidth={1.5}
                />
                <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
                  {testimonial.text}
                </p>
                <p className="font-serif text-sm font-bold text-on-surface">
                  {testimonial.name}
                </p>
                <p className="text-on-surface-variant text-xs">
                  {testimonial.country}
                </p>
              </GlassCard>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dim transition-colors"
            >
              Read more reviews <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface uppercase text-center mb-12">
            Meet the Team
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trainers.map((trainer) => (
              <GlassCard key={trainer.name}>
                <ImagePlaceholder
                  category="team"
                  aspectRatio="aspect-square"
                  className="mb-4"
                />
                <h3 className="font-serif text-base sm:text-lg font-bold text-on-surface text-center">
                  {trainer.name}
                </h3>
                <p className="text-on-surface-variant text-xs sm:text-sm text-center mt-1">
                  {trainer.role}
                </p>
              </GlassCard>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/team"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dim transition-colors"
            >
              Meet the full team <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed text-center">
            Chor Ratchawat Muay Thai Gym is a training camp in Koh Samui,
            Thailand, with two locations in{" "}
            <Link
              href="/camps/bo-phut"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              Bo Phut
            </Link>{" "}
            and{" "}
            <Link
              href="/camps/plai-laem"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              Plai Laem
            </Link>
            . The gym offers{" "}
            <Link
              href="/programs/group-adults"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              group classes
            </Link>
            ,{" "}
            <Link
              href="/programs/private"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              private 1-on-1 lessons
            </Link>
            ,{" "}
            <Link
              href="/programs/group-kids"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              kids programs
            </Link>
            , and a competitive{" "}
            <Link
              href="/programs/fighter"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              fighter program
            </Link>
            . Open 6 days a week from 8 AM to 8 PM. Drop-in sessions start at
            500 THB (~$15 USD).
          </p>
        </div>
      </section>

      <CTABanner
        title="Book Your First Session"
        description="Start training at Ratchawat Koh Samui today"
        buttonText="Book Now"
        href="/booking"
      />
    </>
  );
}
