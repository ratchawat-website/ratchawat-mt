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
  title: "Muay Thai Prices Koh Samui | Ratchawat - From 400 THB",
  description:
    "Muay Thai training prices at Ratchawat Koh Samui. Drop-in 400 THB, weekly and monthly packages, private lessons, fighter program. Transparent pricing, no hidden fees.",
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
              price: 400,
              priceCurrency: "THB",
            },
          }),
          offerCatalogSchema({
            name: "Ratchawat Muay Thai Training Packages",
            description: "Training packages at Chor Ratchawat Muay Thai Gym, Koh Samui",
            offers: [
              { name: "Drop-in Session (Adult)", price: 400, description: "Single adult group class" },
              { name: "Drop-in Session (Kids)", price: 300, description: "Single kids group class" },
              { name: "Weekly Package 1x/day", price: 2000, description: "1 session per day for one week" },
              { name: "Weekly Package 2x/day", price: 3000, description: "2 sessions per day for one week" },
              { name: "Monthly Package 1x/day", price: 5500, description: "1 session per day for one month" },
              { name: "Monthly Package 2x/day", price: 7000, description: "2 sessions per day for one month" },
              { name: "Private Lesson Adult 1-on-1", price: 800, description: "60-minute solo private session" },
              { name: "Private Lesson Adult Group", price: 600, description: "60-minute group private session" },
              { name: "Private Lesson Kids 1-on-1", price: 600, description: "60-minute solo private session for kids" },
              { name: "Private Lesson Kids Group", price: 400, description: "60-minute group private session for kids" },
              { name: "Fighter Program Monthly", price: 9500, description: "Full fighter prep: 2x/day training, yoga, ice bath, fight organisation and corner support" },
              { name: "Resident Monthly (1x/day)", price: 3000, description: "Monthly 1 session per day for Koh Samui residents" },
              { name: "DTV 6-Month Training — 2 sessions/week", price: 20000, description: "DTV visa package, 2 sessions/week for 6 months" },
              { name: "DTV 6-Month Training — 4 sessions/week", price: 25000, description: "DTV visa package, 4 sessions/week for 6 months" },
              { name: "DTV 6-Month Training — Unlimited", price: 33000, description: "DTV visa package, unlimited training for 6 months" },
              { name: "Bodyweight Area Drop-in", price: 100, description: "Single-day access to bodyweight area" },
              { name: "Bodyweight Area Monthly", price: 900, description: "Monthly access to bodyweight area" },
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">SINGLE CLASS</span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-8">
            Drop-in Sessions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Adult Drop-in */}
            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-4">
                Adult
              </h3>
              <div className="mb-4">
                <span className="font-serif text-4xl lg:text-5xl font-bold text-primary">
                  400 THB
                </span>
                <span className="text-on-surface-variant text-sm ml-2">
                  (~$12 USD)
                </span>
                <p className="text-on-surface-variant text-sm mt-2">per session</p>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> 1 group class (morning or afternoon)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> All equipment included
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Both locations available
                </li>
              </ul>
              <Link
                href="/booking/training?package=drop-in-adult"
                className="btn-primary w-full justify-center"
              >
                Book Now <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>

            {/* Kids Drop-in */}
            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-4">
                Kids
              </h3>
              <div className="mb-4">
                <span className="font-serif text-4xl lg:text-5xl font-bold text-primary">
                  300 THB
                </span>
                <span className="text-on-surface-variant text-sm ml-2">
                  (~$9 USD)
                </span>
                <p className="text-on-surface-variant text-sm mt-2">per session</p>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> 1 kids group class
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> All equipment included
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Both locations available
                </li>
              </ul>
              <Link
                href="/booking/training?package=drop-in-kids"
                className="btn-primary w-full justify-center"
              >
                Book Now <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Weekly & Monthly Packages */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">PACKAGES</span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-8">
            Weekly &amp; Monthly Packages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Weekly 1x/day */}
            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-4">
                Weekly &mdash; 1x / day
              </h3>
              <div className="mb-4">
                <span className="font-serif text-3xl lg:text-4xl font-bold text-primary">
                  2,000 THB
                </span>
                <span className="text-on-surface-variant text-sm ml-2">
                  (~$59 USD)
                </span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> 1 session per day, 6 days
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Morning or afternoon
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Both locations
                </li>
              </ul>
              <Link
                href="/booking/training?package=weekly-1x"
                className="btn-primary w-full justify-center"
              >
                Book Weekly <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>

            {/* Weekly 2x/day */}
            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-4">
                Weekly &mdash; 2x / day
              </h3>
              <div className="mb-4">
                <span className="font-serif text-3xl lg:text-4xl font-bold text-primary">
                  3,000 THB
                </span>
                <span className="text-on-surface-variant text-sm ml-2">
                  (~$89 USD)
                </span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Morning + afternoon, 6 days
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Maximum training volume
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Both locations
                </li>
              </ul>
              <Link
                href="/booking/training?package=weekly-2x"
                className="btn-primary w-full justify-center"
              >
                Book Weekly <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>

            {/* Monthly 1x/day */}
            <GlassCard className="ring-2 ring-primary">
              <div className="mb-3">
                <span className="badge-underline badge-orange">Most Popular</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-4">
                Monthly &mdash; 1x / day
              </h3>
              <div className="mb-4">
                <span className="font-serif text-3xl lg:text-4xl font-bold text-primary">
                  5,500 THB
                </span>
                <span className="text-on-surface-variant text-sm ml-2">
                  (~$163 USD)
                </span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> 1 session per day, 30 days
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Morning or afternoon
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Both locations
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Best value for regular training
                </li>
              </ul>
              <Link
                href="/booking/training?package=monthly-1x"
                className="btn-primary w-full justify-center"
              >
                Book Monthly <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>

            {/* Monthly 2x/day */}
            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-4">
                Monthly &mdash; 2x / day
              </h3>
              <div className="mb-4">
                <span className="font-serif text-3xl lg:text-4xl font-bold text-primary">
                  7,000 THB
                </span>
                <span className="text-on-surface-variant text-sm ml-2">
                  (~$207 USD)
                </span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Morning + afternoon, 30 days
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Maximum monthly volume
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Both locations
                </li>
              </ul>
              <Link
                href="/booking/training?package=monthly-2x"
                className="btn-primary w-full justify-center"
              >
                Book Monthly <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
          </div>
          <p className="text-center mt-6 text-on-surface-variant text-sm">
            Staying 2 weeks? Ask us about the 2-week rate when you arrive.
          </p>
        </div>
      </section>

      {/* Private Lessons */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">1-ON-1</span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-8">
            Private Lessons
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Adult Private */}
            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-4">
                Adult
              </h3>
              <ul className="space-y-4 text-sm mb-6">
                <li className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2 text-on-surface-variant">
                    <Check size={16} className="text-primary shrink-0 mt-0.5" />
                    <span>1-on-1 private session (60 min)</span>
                  </div>
                  <span className="font-bold text-primary shrink-0">800 THB</span>
                </li>
                <li className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2 text-on-surface-variant">
                    <Check size={16} className="text-primary shrink-0 mt-0.5" />
                    <span>Small group private session (60 min, 3 people max)</span>
                  </div>
                  <span className="font-bold text-primary shrink-0">600 THB</span>
                </li>
              </ul>
              <Link
                href="/booking/private?package=private-adult-solo"
                className="btn-primary w-full justify-center"
              >
                Book Private <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>

            {/* Kids Private */}
            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-4">
                Kids
              </h3>
              <ul className="space-y-4 text-sm mb-6">
                <li className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2 text-on-surface-variant">
                    <Check size={16} className="text-primary shrink-0 mt-0.5" />
                    <span>1-on-1 private session (60 min)</span>
                  </div>
                  <span className="font-bold text-primary shrink-0">600 THB</span>
                </li>
                <li className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2 text-on-surface-variant">
                    <Check size={16} className="text-primary shrink-0 mt-0.5" />
                    <span>Small group private session (60 min, 3 kids max)</span>
                  </div>
                  <span className="font-bold text-primary shrink-0">400 THB</span>
                </li>
              </ul>
              <Link
                href="/booking/private?package=private-kids-solo"
                className="btn-primary w-full justify-center"
              >
                Book Private <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
          </div>
          <p className="text-center mt-6 text-on-surface-variant text-sm">
            Want to learn more about{" "}
            <Link href="/programs/private" className="btn-link">
              private training <span className="btn-arrow">&rarr;</span>
            </Link>
            ?
          </p>
        </div>
      </section>

      {/* Fighter Program */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">FIGHTER</span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-8">
            Fighter Program
          </h2>
          <GlassCard>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                  Fighter Monthly
                </h3>
                <div className="mb-4">
                  <span className="font-serif text-4xl lg:text-5xl font-bold text-primary">
                    9,500 THB
                  </span>
                  <span className="text-on-surface-variant text-sm ml-2">
                    (~$281 USD) / month
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-primary shrink-0" /> 2 training sessions per day
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-primary shrink-0" /> Weekly yoga session
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-primary shrink-0" /> Weekly ice bath recovery
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-primary shrink-0" /> Fight organisation and matchmaking
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-primary shrink-0" /> Corner support on fight day
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <Link
                  href="/booking/fighter?package=fighter-monthly"
                  className="btn-primary justify-center"
                >
                  Apply Now <span className="btn-arrow">&rarr;</span>
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

      {/* Camp Stay Packages */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">PLAI LAEM STAY</span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-4">
            Camp Stay Packages
          </h2>
          <p className="text-center text-on-surface-variant text-sm mb-10 max-w-2xl mx-auto">
            Training and on-site accommodation at our Plai Laem camp. Rooms and bungalows available.
            Electricity is included for 1-week and 2-week stays.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-3">1 Week</h3>
              <div className="mb-4">
                <span className="font-serif text-4xl font-bold text-primary">8,000 THB</span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> 7 nights in a standard room</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Unlimited group training</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Electricity + Wi-Fi included</li>
              </ul>
              <Link href="/booking/camp-stay?package=camp-stay-1week" className="btn-primary w-full justify-center">
                Book 1 Week <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
            <GlassCard className="ring-2 ring-primary">
              <div className="mb-2"><span className="badge-underline badge-orange">Best Value</span></div>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-3">2 Weeks</h3>
              <div className="mb-4">
                <span className="font-serif text-4xl font-bold text-primary">15,000 THB</span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> 14 nights in a standard room</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Unlimited group training</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Electricity + Wi-Fi included</li>
              </ul>
              <Link href="/booking/camp-stay?package=camp-stay-2weeks" className="btn-primary w-full justify-center">
                Book 2 Weeks <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-3">1 Month - Room</h3>
              <div className="mb-4">
                <span className="font-serif text-4xl font-bold text-primary">18,000 THB</span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> 30 nights in a standard room</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Unlimited group training</li>
                <li className="flex items-center gap-2 opacity-50"><Check size={16} className="shrink-0" aria-hidden="true" /> Electricity charged separately</li>
              </ul>
              <Link href="/booking/camp-stay?package=camp-stay-1month" className="btn-primary w-full justify-center">
                Book Room <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
            <GlassCard>
              <div className="mb-2"><span className="badge-underline badge-orange">Unique - 1 on-site</span></div>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-3">1 Month - Bungalow</h3>
              <div className="mb-4">
                <span className="font-serif text-4xl font-bold text-primary">23,000 THB</span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> 30 nights in the private bungalow</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> King bed, kitchenette, private terrace</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Unlimited group training</li>
                <li className="flex items-center gap-2 opacity-50"><Check size={16} className="shrink-0" aria-hidden="true" /> Electricity charged separately</li>
              </ul>
              <Link href="/booking/camp-stay?package=camp-stay-bungalow-monthly" className="btn-primary w-full justify-center">
                Book Bungalow <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
          </div>
          <p className="text-center mt-8 text-on-surface-variant text-sm">
            Looking for Fighter Program with accommodation? See the{" "}
            <Link href="/accommodation" className="btn-link">full accommodation options <span className="btn-arrow">&rarr;</span></Link>
            {" "}(approximately 20,000 THB/month with a room, 25,500 THB/month with the bungalow).
          </p>
        </div>
      </section>

      {/* Resident Rates */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">LOCAL RATES</span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-8">
            Resident Rate
          </h2>
          <div className="max-w-md mx-auto">
            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-4">
                Monthly (1x/day)
              </h3>
              <div className="mb-4">
                <span className="font-serif text-3xl lg:text-4xl font-bold text-primary">
                  3,000 THB
                </span>
                <span className="text-on-surface-variant text-sm ml-2">
                  (~$89 USD)
                </span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> 1 group session per day
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> 6 days a week (Mon-Sat)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> Both locations
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-primary shrink-0" /> For Koh Samui residents
                </li>
              </ul>
              <Link
                href="/contact"
                className="btn-primary w-full justify-center"
              >
                Contact Us <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
          </div>
          <p className="text-center mt-6 text-on-surface-variant text-sm">
            Proof of residence required. Contact us to activate your resident rate.
          </p>
        </div>
      </section>

      {/* DTV Visa Packages */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">LONG STAY</span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-4">
            DTV Visa Training Packages
          </h2>
          <p className="text-on-surface-variant text-sm text-center max-w-2xl mx-auto mb-8">
            Six-month training packages that include the official enrollment letter required for your
            Destination Thailand Visa application. Documents provided within 24 hours of payment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-3">2 sessions/week</h3>
              <div className="mb-4">
                <span className="font-serif text-3xl lg:text-4xl font-bold text-primary">20,000 THB</span>
                <span className="text-on-surface-variant text-sm ml-2">/ 6 months</span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> 2 group sessions per week</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Both camps (Bo Phut + Plai Laem)</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Bodyweight area access</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Full DTV documents assistance</li>
              </ul>
              <Link href="/visa/dtv" className="btn-primary w-full justify-center">
                Apply <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-lg font-bold text-on-surface uppercase">4 sessions/week</h3>
                <span className="badge-underline badge-orange">Popular</span>
              </div>
              <div className="mb-4">
                <span className="font-serif text-3xl lg:text-4xl font-bold text-primary">25,000 THB</span>
                <span className="text-on-surface-variant text-sm ml-2">/ 6 months</span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> 4 group sessions per week</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Both camps (Bo Phut + Plai Laem)</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Bodyweight area access</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Full DTV documents assistance</li>
              </ul>
              <Link href="/visa/dtv" className="btn-primary w-full justify-center">
                Apply <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>

            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-3">Unlimited</h3>
              <div className="mb-4">
                <span className="font-serif text-3xl lg:text-4xl font-bold text-primary">33,000 THB</span>
                <span className="text-on-surface-variant text-sm ml-2">/ 6 months</span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Unlimited training (1-2 sessions/day)</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Both camps (Bo Phut + Plai Laem)</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Bodyweight area access</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Full DTV documents assistance</li>
              </ul>
              <Link href="/visa/dtv" className="btn-primary w-full justify-center">
                Apply <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
          </div>
          <p className="text-center mt-6 text-on-surface-variant text-xs max-w-2xl mx-auto">
            No refund if the visa is refused, but a training voucher at our camp is provided instead.
            See <Link href="/visa/dtv" className="text-primary hover:text-primary-dim">the DTV page</Link> for the full process.
          </p>
        </div>
      </section>

      {/* Bodyweight Area */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">GYM ACCESS</span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-8">
            Bodyweight Area
          </h2>
          <GlassCard>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-on-surface-variant text-sm mb-4 max-w-sm">
                  Open access to our conditioning and bodyweight training area. No Muay Thai class required.
                </p>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-primary shrink-0" />
                    <span>Drop-in access:</span>
                    <span className="font-bold text-primary">100 THB / day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-primary shrink-0" />
                    <span>Monthly access:</span>
                    <span className="font-bold text-primary">900 THB / month</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/contact"
                className="btn-primary shrink-0 justify-center"
              >
                Get Access <span className="btn-arrow">&rarr;</span>
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">INCLUDED</span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
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
            <Link href="/accommodation" className="btn-link">
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
            Muay Thai training at Chor Ratchawat Gym in Koh Samui, Thailand starts at 400 THB
            (~$12 USD) for an adult drop-in session. Monthly packages run from 5,500 THB (1x/day)
            to 7,000 THB (2x/day). The Fighter Program costs 9,500 THB per month and includes
            2 daily sessions, weekly yoga, weekly ice bath, fight organisation, and corner support.
            Camp Stay packages at Plai Laem combine training and accommodation from 8,000 THB
            per week to 23,000 THB per month for a private bungalow. All training packages cover
            both Bo Phut and Plai Laem locations.
          </p>
        </div>
      </section>

      <CTABanner
        title="Ready to Start Training?"
        description="Book your session and pay securely online"
        buttonText="Book Now"
        href="/booking"
        ghostText="Contact Us"
        ghostHref="/contact"
      />
    </>
  );
}
