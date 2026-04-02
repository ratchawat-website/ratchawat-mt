import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import CTABanner from "@/components/ui/CTABanner";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import { MapPin, Wifi, Utensils, Bed, DollarSign, Users } from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Muay Thai Accommodation Koh Samui | Train & Stay \u2014 Ratchawat",
  description:
    "Stay near Ratchawat Muay Thai in Koh Samui. Accommodation options near both Bo Phut and Plai Laem camps. Training + stay packages available.",
  path: "/accommodation",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const lodgingSchema = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "US Hostel / US Samui",
  description: "Partner accommodation near Ratchawat Bo Phut camp in Koh Samui.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bo Phut, Ko Samui",
    addressRegion: "Surat Thani",
    postalCode: "84320",
    addressCountry: "TH",
  },
  priceRange: "$",
  parentOrganization: {
    "@type": "Organization",
    name: "Chor Ratchawat Muay Thai Gym",
    url: SITE_URL,
  },
};

const boPhutOptions = [
  {
    icon: Bed,
    title: "US Hostel / US Samui",
    description: "Our partner hostel in Bo Phut. Walking distance from the gym. Dorm beds and private rooms. Popular with training students.",
    price: "From 300 THB/night",
  },
  {
    icon: MapPin,
    title: "Guesthouses on Soi Sunday",
    description: "Several small guesthouses within a few minutes of the camp. Basic, clean, and cheap. Ask us for current recommendations.",
    price: "From 400 THB/night",
  },
  {
    icon: Utensils,
    title: "Fisherman's Village Area",
    description: "More options (hotels, Airbnbs, apartments) near Fisherman's Village. 5 minutes from the gym by scooter. Better food and nightlife nearby.",
    price: "From 600 THB/night",
  },
];

const plaiLaemOptions = [
  {
    icon: Bed,
    title: "Guesthouses Near Big Buddha",
    description: "Quiet area with budget guesthouses and bungalows. Close to the camp, away from the tourist noise.",
    price: "From 400 THB/night",
  },
  {
    icon: Wifi,
    title: "Apartments & Condos",
    description: "Monthly rentals are common in this area. Good for 90-day visa holders and long-stay students. Kitchens, wifi, laundry.",
    price: "From 8,000 THB/month",
  },
  {
    icon: Users,
    title: "Shared Houses",
    description: "Some students share houses with other fighters. We can connect you with others looking for roommates.",
    price: "From 5,000 THB/month",
  },
];

const tips = [
  {
    icon: DollarSign,
    title: "Budget Tip",
    description: "Monthly rentals are much cheaper than nightly rates. If you are staying more than 2 weeks, look for a monthly place.",
  },
  {
    icon: MapPin,
    title: "Location Tip",
    description: "Staying near your camp makes training easier. A scooter (200 THB/day) opens up the whole island if you want more options.",
  },
];

export default function AccommodationPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), lodgingSchema]} />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Accommodation" }]}
      />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-on-surface">
            Accommodation
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Where to stay near both camps. From hostels to apartments, budget to comfortable.
          </p>
        </div>
      </section>

      {/* Bo Phut Area */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">BO PHUT</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            Near{" "}
            <Link href="/camps/bo-phut" className="text-primary hover:text-primary-dim transition-colors">Bo Phut Camp</Link>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="grid grid-cols-1 gap-4">
              {boPhutOptions.map((opt, i) => (
                <GlassCard key={opt.title} number={String(i + 1).padStart(2, "0")}>
                  <div className="flex gap-4 items-start">
                    <opt.icon size={24} className="text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-serif text-lg font-bold text-on-surface mb-1">
                        {opt.title}
                      </h3>
                      <p className="text-on-surface-variant text-xs leading-relaxed mb-2">
                        {opt.description}
                      </p>
                      <p className="text-primary text-xs font-semibold">
                        {opt.price}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
            <ImagePlaceholder category="accommodation" aspectRatio="aspect-[3/4]" />
          </div>
        </div>
      </section>

      {/* Plai Laem Area */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">PLAI LAEM</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            Near{" "}
            <Link href="/camps/plai-laem" className="text-primary hover:text-primary-dim transition-colors">Plai Laem Camp</Link>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <ImagePlaceholder category="accommodation" aspectRatio="aspect-[3/4]" className="lg:order-2" />
            <div className="grid grid-cols-1 gap-4 lg:order-1">
              {plaiLaemOptions.map((opt, i) => (
                <GlassCard key={opt.title} number={String(i + 1).padStart(2, "0")}>
                  <div className="flex gap-4 items-start">
                    <opt.icon size={24} className="text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-serif text-lg font-bold text-on-surface mb-1">
                        {opt.title}
                      </h3>
                      <p className="text-on-surface-variant text-xs leading-relaxed mb-2">
                        {opt.description}
                      </p>
                      <p className="text-primary text-xs font-semibold">
                        {opt.price}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">TIPS</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
            Tips
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {tips.map((tip, i) => (
              <GlassCard key={tip.title} number={String(i + 1).padStart(2, "0")}>
                <tip.icon size={24} className="text-primary mb-3" />
                <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                  {tip.title}
                </h3>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  {tip.description}
                </p>
              </GlassCard>
            ))}
          </div>
          <p className="mt-6 text-on-surface-variant text-base">
            Not sure where to stay?{" "}
            <Link href="/contact" className="text-primary hover:text-primary-dim transition-colors font-medium">Message us</Link>
            {" "}and we will point you in the right direction based on your budget and how long you are staying.
          </p>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Ratchawat Muay Thai partners with local accommodations near both Koh Samui locations. In Bo Phut, the camp works with US Hostel / US Samui near Fisherman&apos;s Village. Accommodation options near the Plai Laem camp are also available. Training and stay packages combine lodging with daily Muay Thai classes.
          </p>
        </div>
      </section>

      <CTABanner
        title="Book Training, Sort Stay Later"
        description="We can help with accommodation once you have your dates."
        buttonText="Book Now"
        href="/booking"
        ghostText="View Pricing"
        ghostHref="/pricing"
      />
    </>
  );
}
