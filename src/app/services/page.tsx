import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import CTABanner from "@/components/ui/CTABanner";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import { Car, ShoppingBag, HeartPulse, Shield, Wrench, HelpCircle } from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Services | Ratchawat Muay Thai Koh Samui \u2014 Transport, Gear & More",
  description:
    "Services at Ratchawat Muay Thai Koh Samui. Transportation, training gear, health insurance guidance. Everything you need for your training stay.",
  path: "/services",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const serviceSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Transportation",
    description: "Airport pickup, scooter rental guidance, and directions to both camps.",
    provider: { "@type": "Organization", name: "Chor Ratchawat Muay Thai Gym", url: SITE_URL },
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Training Gear",
    description: "Gear rental and purchase options for Muay Thai training equipment.",
    provider: { "@type": "Organization", name: "Chor Ratchawat Muay Thai Gym", url: SITE_URL },
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Health Insurance Guidance",
    description: "Information on health insurance options for international visitors training in Thailand.",
    provider: { "@type": "Organization", name: "Chor Ratchawat Muay Thai Gym", url: SITE_URL },
  },
];

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), ...serviceSchemas]} />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Services" }]}
      />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-on-surface">
            Services
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Beyond training. Transport, gear, insurance, and the practical stuff that makes your stay easier.
          </p>
        </div>
      </section>

      {/* Transportation */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-on-surface mb-8">
            Transportation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <GlassCard>
              <Car size={28} className="text-primary mb-3" />
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Airport Pickup
              </h3>
              <p className="text-on-surface-variant text-sm">
                We can arrange pickup from Samui Airport (USM). Let us know your flight details when you book. Cost varies by distance to your accommodation.
              </p>
            </GlassCard>
            <GlassCard>
              <Wrench size={28} className="text-primary mb-3" />
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Scooter Rental
              </h3>
              <p className="text-on-surface-variant text-sm">
                Most students rent a scooter. From 200 THB/day or 3,000-4,000 THB/month. We can point you to reliable rental shops near both camps.
              </p>
            </GlassCard>
            <GlassCard>
              <HelpCircle size={28} className="text-primary mb-3" />
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Getting Around
              </h3>
              <p className="text-on-surface-variant text-sm">
                Grab works on Koh Samui. Songthaew (shared taxis) run the main routes. Both camps are easy to reach. See directions on the{" "}
                <Link href="/camps/bo-phut" className="text-primary hover:text-primary-dim transition-colors">Bo Phut</Link>
                {" "}and{" "}
                <Link href="/camps/plai-laem" className="text-primary hover:text-primary-dim transition-colors">Plai Laem</Link>
                {" "}pages.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Training Gear */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-on-surface mb-8">
            Training Gear
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <GlassCard>
              <ShoppingBag size={28} className="text-primary mb-3" />
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Gear Rental
              </h3>
              <p className="text-on-surface-variant text-sm">
                Gloves and shin guards available at the gym. 100 THB per session. Good enough for your first few days.
              </p>
            </GlassCard>
            <GlassCard>
              <Shield size={28} className="text-primary mb-3" />
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Buy on the Island
              </h3>
              <p className="text-on-surface-variant text-sm">
                Koh Samui has shops selling Muay Thai gear (Twins, Fairtex, Top King). Budget 1,500-3,000 THB for a decent pair of gloves. We can recommend shops.
              </p>
            </GlassCard>
            <GlassCard>
              <ShoppingBag size={28} className="text-primary mb-3" />
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                What You Need
              </h3>
              <p className="text-on-surface-variant text-sm">
                Minimum: shorts and a t-shirt. For regular training: gloves, shin guards, hand wraps, and a mouthguard. Fighters also need a groin guard and headgear.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Health Insurance */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-on-surface mb-6">
            Health Insurance
          </h2>
          <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              <HeartPulse size={20} className="text-primary inline mr-2" />
              We strongly recommend travel insurance that covers sports activities. Most standard travel policies exclude combat sports. Check your policy or get one that specifically covers Muay Thai.
            </p>
            <p>
              Koh Samui has good hospitals (Bangkok Hospital Samui, Thai International Hospital) but medical costs add up without insurance. A broken nose or sprained ankle can cost 10,000-50,000 THB out of pocket.
            </p>
            <p>
              Providers like World Nomads and SafetyWing offer plans that cover Muay Thai training. We can give you more details when you arrive. This is not medical advice, just what we have seen work for other students.
            </p>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto space-y-3 text-on-surface-variant text-base">
          <p>
            Need help with visas?{" "}
            <Link href="/visa/dtv" className="text-primary hover:text-primary-dim transition-colors font-medium">DTV visa (180 days)</Link>
            {" "}or{" "}
            <Link href="/visa/90-days" className="text-primary hover:text-primary-dim transition-colors font-medium">90-day education visa</Link>.
          </p>
          <p>
            Looking for a place to stay?{" "}
            <Link href="/accommodation" className="text-primary hover:text-primary-dim transition-colors font-medium">Accommodation options</Link>
            {" "}near both camps.
          </p>
          <p>
            See{" "}
            <Link href="/pricing" className="text-primary hover:text-primary-dim transition-colors font-medium">pricing</Link>
            {" "}for training packages.
          </p>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Ratchawat Muay Thai Koh Samui offers additional services including transportation to and from the gyms, training gear and equipment sales, and health insurance guidance for international visitors training in Thailand.
          </p>
        </div>
      </section>

      <CTABanner
        title="Ready to Train?"
        description="We handle the details. You focus on training."
        buttonText="Book Now"
        href="/booking"
      />
    </>
  );
}
