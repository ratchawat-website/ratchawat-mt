import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import CTABanner from "@/components/ui/CTABanner";
import JsonLd from "@/components/seo/JsonLd";
import {
  organizationSchema,
  courseSchema,
  offerCatalogSchema,
} from "@/components/seo/SchemaOrg";
import { Check } from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Muay Thai Prices Koh Samui | Ratchawat - From 500 THB",
  description:
    "Muay Thai training prices at Ratchawat Koh Samui. Drop-in 500 THB, weekly & monthly packages available. Group, private lessons & fighter programs.",
  path: "/pricing",
});

const included = [
  "Experienced Thai trainers",
  "Full equipment provided",
  "Ring access",
  "Bag stations and pads",
  "Conditioning area",
  "Access to both Bo Phut and Plai Laem locations",
];

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          courseSchema({
            name: "Muay Thai Training at Ratchawat",
            description:
              "Muay Thai group classes, private lessons, kids programs, and fighter training at Chor Ratchawat Gym in Koh Samui.",
            url: "https://ratchawatmuaythai.com/pricing",
            offers: {
              price: 500,
              priceCurrency: "THB",
            },
          }),
          offerCatalogSchema({
            name: "Ratchawat Muay Thai Training Packages",
            description: "Training packages at Chor Ratchawat Muay Thai Gym, Koh Samui",
            offers: [
              { name: "Drop-in Session", price: 500, description: "Single group class" },
              { name: "Weekly Package (5 days)", price: 2000, description: "10 sessions, morning and afternoon" },
              { name: "Monthly Unlimited", price: 5500, description: "Unlimited group sessions" },
              { name: "Private Lesson (Single)", price: 1500, description: "60-minute 1-on-1 session" },
              { name: "Private Lessons (10-Pack)", price: 12000, description: "10 private sessions, save 20%" },
              { name: "Fighter Program (Monthly)", price: 8000, description: "Unlimited group + 5 private/week + fight prep" },
            ],
          }),
        ]}
      />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Pricing" }]}
      />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-on-surface">
            Muay Thai Training Prices
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Transparent pricing for every training goal. All prices include
            access to both Bo Phut and Plai Laem camps.
          </p>
        </div>
      </section>

      {/* Drop-in Sessions */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">SINGLE CLASS</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-8">
            Drop-in Sessions
          </h2>
          <GlassCard>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="font-serif text-4xl lg:text-5xl font-bold text-primary">
                  500 THB
                </span>
                <span className="text-on-surface-variant text-sm ml-2">
                  (~$15 USD)
                </span>
                <p className="text-on-surface-variant text-sm mt-3">
                  per session
                </p>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> 1 group
                  class (morning or afternoon)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> All
                  equipment included
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Both
                  locations available
                </li>
              </ul>
              <Link
                href="/booking?package=drop-in"
                className="btn-primary shrink-0"
              >
                Book Now <span className="btn-arrow">&rarr;</span>
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Weekly & Monthly Packages */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">PACKAGES</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-8">
            Weekly & Monthly Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly */}
            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-4">
                Weekly (5 Days)
              </h3>
              <div className="mb-4">
                <span className="font-serif text-3xl lg:text-4xl font-bold text-primary">
                  2,000 THB
                </span>
                <span className="text-on-surface-variant text-sm ml-2">
                  (~$60 USD)
                </span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> 10
                  sessions (morning + afternoon)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Both
                  locations
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> All
                  equipment included
                </li>
              </ul>
              <Link
                href="/booking?package=weekly"
                className="btn-primary w-full justify-center"
              >
                Book Weekly <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>

            {/* Monthly */}
            <GlassCard className="ring-2 ring-primary">
              <div className="mb-3">
                <span className="badge-underline badge-orange">Most Popular</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-4">
                Monthly Unlimited
              </h3>
              <div className="mb-4">
                <span className="font-serif text-3xl lg:text-4xl font-bold text-primary">
                  5,500 THB
                </span>
                <span className="text-on-surface-variant text-sm ml-2">
                  (~$167 USD)
                </span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" />{" "}
                  Unlimited group sessions
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Both
                  locations
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> All
                  equipment included
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Best
                  value for regular training
                </li>
              </ul>
              <Link
                href="/booking?package=monthly"
                className="btn-primary w-full justify-center"
              >
                Book Monthly <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Private Lessons */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">1-ON-1</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-8">
            Private Lessons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Single */}
            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-4">
                Single Session
              </h3>
              <div className="mb-4">
                <span className="font-serif text-3xl lg:text-4xl font-bold text-primary">
                  1,500 THB
                </span>
                <span className="text-on-surface-variant text-sm ml-2">
                  (~$45 USD)
                </span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> 60
                  minutes, 1-on-1
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Fully
                  personalized to your goals
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Choose
                  your trainer
                </li>
              </ul>
              <Link
                href="/booking?package=private-single"
                className="btn-primary w-full justify-center"
              >
                Book Private <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>

            {/* 10-Pack */}
            <GlassCard className="ring-2 ring-primary">
              <div className="mb-3">
                <span className="badge-underline badge-orange">Save 20%</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-4">
                10-Session Pack
              </h3>
              <div className="mb-4">
                <span className="font-serif text-3xl lg:text-4xl font-bold text-primary">
                  12,000 THB
                </span>
                <span className="text-on-surface-variant text-sm ml-2">
                  (~$365 USD)
                </span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> 10
                  private sessions
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> 1,200
                  THB per session (vs 1,500)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Flexible
                  scheduling
                </li>
              </ul>
              <Link
                href="/booking?package=private-10"
                className="btn-primary w-full justify-center"
              >
                Book 10-Pack <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
          </div>
          <p className="text-center mt-6 text-on-surface-variant text-sm">
            Want to learn more about{" "}
            <Link
              href="/programs/private"
              className="btn-link"
            >
              private training <span className="btn-arrow">&rarr;</span>
            </Link>
            ?
          </p>
        </div>
      </section>

      {/* Fighter Program */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">FIGHTER</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-8">
            Fighter Program Packages
          </h2>
          <GlassCard>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                  Fighter Monthly
                </h3>
                <div className="mb-4">
                  <span className="font-serif text-4xl lg:text-5xl font-bold text-primary">
                    8,000 THB
                  </span>
                  <span className="text-on-surface-variant text-sm ml-2">
                    (~$243 USD) / month
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-primary shrink-0" />{" "}
                    Unlimited group sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-primary shrink-0" /> 5
                    private sessions per week
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-primary shrink-0" /> Fight
                    preparation and strategy
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-primary shrink-0" />{" "}
                    Cornerman support on fight day
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-primary shrink-0" />{" "}
                    Conditioning and sparring
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <Link
                  href="/contact"
                  className="btn-primary justify-center"
                >
                  Contact Us <span className="btn-arrow">&rarr;</span>
                </Link>
                <Link
                  href="/programs/fighter"
                  className="btn-link text-sm justify-center"
                >
                  Learn more about the program <span className="btn-arrow">&rarr;</span>
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">INCLUDED</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-8">
            What&#39;s Included
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {included.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Check size={20} className="text-primary shrink-0" />
                <span className="text-on-surface text-sm">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-on-surface-variant text-sm">
            Looking for{" "}
            <Link
              href="/accommodation"
              className="btn-link"
            >
              accommodation near the camps <span className="btn-arrow">&rarr;</span>
            </Link>
            ?
          </p>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Muay Thai training at Ratchawat Koh Samui starts at 500 THB (~$15
            USD) per drop-in session. Monthly memberships are 5,500 THB (~$167
            USD). Private 1-on-1 lessons and weekly intensive packages are also
            available. Prices include access to both Bo Phut and Plai Laem
            locations.
          </p>
        </div>
      </section>

      <CTABanner
        title="Ready to Start Training?"
        description="Book your session and pay securely online"
        buttonText="Book Now"
        href="/booking"
        ghostText="View Pricing"
        ghostHref="/pricing"
      />
    </>
  );
}
