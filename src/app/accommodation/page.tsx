import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import CTABanner from "@/components/ui/CTABanner";
import Image from "next/image";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import {
  BedDouble,
  Bath,
  Wind,
  Wifi,
  Waves,
  Fence,
  Package,
  Zap,
  Users,
  Tag,
  Check,
  UtensilsCrossed,
  Armchair,
  Palmtree,
  Refrigerator,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { buildWhatsAppUrl, CAMP_WHATSAPP_DISPLAY } from "@/content/schedule";

export const metadata = generatePageMeta({
  title: "Muay Thai Accommodation Koh Samui | Train & Stay - Ratchawat",
  description:
    "Stay at Ratchawat Muay Thai Plai Laem camp in Koh Samui. On-site rooms with pool, AC, balcony. All-inclusive training and stay packages from 8,000 THB.",
  path: "/accommodation",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const lodgingSchema = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Ratchawat Muay Thai Camp Stay - Plai Laem",
  description:
    "On-site accommodation at Ratchawat Muay Thai Plai Laem camp in Koh Samui. Rooms with private bathroom, air conditioning, Wi-Fi, and pool-view balcony. All-inclusive training and stay packages.",
  url: `${SITE_URL}/accommodation`,
  image: `${SITE_URL}/images/room/pool.jpg`,
  telephone: "+66-63-080-2876",
  address: {
    "@type": "PostalAddress",
    streetAddress: "20/33 Moo 5, Plai Laem Soi 13, Tambon Bo Put",
    addressLocality: "Ko Samui",
    addressRegion: "Surat Thani",
    postalCode: "84320",
    addressCountry: "TH",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 9.5697,
    longitude: 100.0664,
  },
  priceRange: "฿฿",
  numberOfRooms: 8,
  checkinTime: "14:00",
  checkoutTime: "11:00",
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Air conditioning", value: true },
    { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
    { "@type": "LocationFeatureSpecification", name: "Private bathroom", value: true },
    { "@type": "LocationFeatureSpecification", name: "Shared pool", value: true },
    { "@type": "LocationFeatureSpecification", name: "Balcony", value: true },
    { "@type": "LocationFeatureSpecification", name: "Fridge", value: true },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: 5.0,
    reviewCount: 396,
    bestRating: 5,
    worstRating: 1,
  },
  parentOrganization: {
    "@type": "Organization",
    name: "Chor Ratchawat Muay Thai Gym",
    url: SITE_URL,
  },
};

const roomPhotos = [
  { src: "/images/room/room.jpeg", caption: "Room", alt: "Standard room overview at Ratchawat Plai Laem camp" },
  { src: "/images/room/room-bed.jpeg", caption: "Bed", alt: "Double bed in standard room" },
  { src: "/images/room/room-bathroom.jpeg", caption: "Bathroom", alt: "Private bathroom in standard room" },
  { src: "/images/room/room-balcony.jpeg", caption: "Balcony", alt: "Pool-view balcony from standard room" },
  { src: "/images/room/room-storage.jpeg", caption: "Storage", alt: "Storage space in standard room" },
  { src: "/images/room/pool.jpg", caption: "Pool", alt: "Shared pool at Ratchawat Plai Laem camp" },
];

const bungalowPhotos = [
  { src: "/images/bungalow/bungalow.jpeg", caption: "Bungalow", alt: "Private bungalow exterior at Ratchawat Plai Laem" },
  { src: "/images/bungalow/bungalow-room.jpeg", caption: "Bedroom", alt: "King-size bed in private bungalow" },
  { src: "/images/bungalow/bungalow-bathroom.jpeg", caption: "Bathroom", alt: "Private bathroom in bungalow" },
  { src: "/images/bungalow/bungalow-kitchenette.jpeg", caption: "Kitchenette", alt: "Fitted kitchenette in bungalow" },
  { src: "/images/bungalow/bungalow-living-room.jpeg", caption: "Living area", alt: "Living and dining area in bungalow" },
  { src: "/images/bungalow/bungalow-storage.jpeg", caption: "Storage", alt: "Storage and dressing area in bungalow" },
  { src: "/images/bungalow/bungalow-terrace.jpeg", caption: "Terrace", alt: "Private terrace with pool view" },
  { src: "/images/bungalow/bungalow-view.jpeg", caption: "View", alt: "View from the private bungalow" },
  { src: "/images/bungalow/pool.jpg", caption: "Pool", alt: "Shared pool seen from bungalow" },
];

const amenities = [
  { icon: BedDouble, label: "Double bed" },
  { icon: Bath, label: "Private bathroom" },
  { icon: Wind, label: "Air conditioning" },
  { icon: Wifi, label: "Wi-Fi" },
  { icon: Waves, label: "Shared pool" },
  { icon: Fence, label: "Pool-view balcony" },
  { icon: Package, label: "Storage" },
  { icon: Refrigerator, label: "Fridge" },
];

const bungalowAmenities = [
  { icon: BedDouble, label: "King-size bed" },
  { icon: Package, label: "Dressing area" },
  { icon: Bath, label: "Private bathroom" },
  { icon: UtensilsCrossed, label: "Kitchenette" },
  { icon: Armchair, label: "Living + dining area" },
  { icon: Palmtree, label: "Private terrace" },
  { icon: Wind, label: "Air conditioning" },
  { icon: Wifi, label: "Wi-Fi" },
  { icon: Refrigerator, label: "Fridge" },
  { icon: Waves, label: "Pool view" },
];

const benefits = [
  {
    icon: Zap,
    title: "Zero Commute",
    description:
      "The gym is 30 seconds away. Train, eat, sleep, repeat. No scooter, no waiting.",
  },
  {
    icon: Users,
    title: "Fighter Community",
    description:
      "You share the camp with other fighters. Sparring partners when you need them, and people who get why you're here.",
  },
  {
    icon: Tag,
    title: "All-In-One Price",
    description:
      "One price covers your room and all your training. No surprises at checkout.",
  },
];

export default function AccommodationPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), lodgingSchema]} />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Accommodation" }]}
      />

      {/* Hero */}
      <section className="relative py-16 sm:py-24 px-6 sm:px-10 md:px-16 lg:px-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#0a0a0a_0%,#1a1200_50%,#0a0a0a_100%)]" />
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,102,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,0,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="w-[60px] h-[3px] bg-primary mb-8" />
          <div className="mb-4">
            <span className="badge-underline badge-orange">PLAI LAEM CAMP ONLY</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-on-surface">
            Stay at the Camp
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Train. Rest. Repeat. Rooms and bungalows inside our Plai Laem camp. Pool view, AC, all-inclusive packages.
          </p>
        </div>
      </section>

      {/* Standard Rooms */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">
              STANDARD ROOM
            </span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface">
              Standard Rooms
            </h2>
            <span className="badge-underline badge-orange">7 ROOMS AVAILABLE</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-4 text-on-surface-variant leading-relaxed">
              <p>
                The rooms are inside the Plai Laem camp. Clean, simple, everything you need after training and nothing you don&apos;t. Each room has a double bed, a private bathroom, air conditioning, and a balcony over the shared pool.
              </p>
              <p>
                The pool is where fighters cool down between sessions. It is not a resort pool, it is a camp pool, and that is the point. You come here to train, and the water is there when your legs need it.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {amenities.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-4 rounded-card bg-surface-low border-2 border-outline-variant"
                >
                  <item.icon size={22} className="text-primary shrink-0" aria-hidden="true" />
                  <span className="text-sm text-on-surface font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Room Photos */}
        <div className="mt-12">
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-6 px-6 sm:px-10 md:px-16 lg:px-20"
            role="region"
            aria-label="Standard room photo gallery"
            tabIndex={0}
          >
            {roomPhotos.map((photo) => (
              <div
                key={photo.caption}
                className="shrink-0 w-[260px] sm:w-[300px] md:w-[340px] snap-start"
              >
                <div className="relative aspect-[3/4] rounded-card overflow-hidden">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 260px, (max-width: 768px) 300px, 340px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.19em] text-on-surface-variant">
                  {photo.caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bungalows */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">
              BUNGALOW
            </span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface">
              The Private Bungalow
            </h2>
            <span className="badge-underline badge-orange">1 BUNGALOW, UNIQUE</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-4 text-on-surface-variant leading-relaxed">
              <p>
                The bungalow is the premium option. Stand-alone, private, with a king-size bed, a dressing area, and a full living space with dining and a fitted kitchenette. The private terrace opens over the shared pool.
              </p>
              <p>
                Built for longer stays, fighters bringing family, or anyone who wants a real home during training. There is only one bungalow on-site, so it books out months in advance.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {bungalowAmenities.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-4 rounded-card bg-surface-low border-2 border-outline-variant"
                >
                  <item.icon size={22} className="text-primary shrink-0" aria-hidden="true" />
                  <span className="text-sm text-on-surface font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bungalow Photos */}
        <div className="mt-12">
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-6 px-6 sm:px-10 md:px-16 lg:px-20"
            role="region"
            aria-label="Private bungalow photo gallery"
            tabIndex={0}
          >
            {bungalowPhotos.map((photo) => (
              <div
                key={photo.caption}
                className="shrink-0 w-[260px] sm:w-[300px] md:w-[340px] snap-start"
              >
                <div className="relative aspect-[3/4] rounded-card overflow-hidden">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 260px, (max-width: 768px) 300px, 340px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.19em] text-on-surface-variant">
                  {photo.caption}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Camp Stay Packages */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">
              ALL-INCLUSIVE
            </span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-4">
            Camp Stay Packages
          </h2>
          <p className="text-center text-on-surface-variant text-sm mb-10">
            Training and accommodation in one package. Electricity is included for 1-week and 2-week stays.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-3">1 Week</h3>
              <div className="mb-4">
                <span className="font-serif text-4xl font-bold text-primary">8,000</span>
                <span className="text-on-surface-variant text-sm ml-1">THB</span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> 7 nights in a standard room</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Unlimited group training</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Electricity included</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Wi-Fi</li>
              </ul>
              <Link href="/booking/camp-stay?package=camp-stay-1week" className="btn-primary w-full justify-center">
                Book 1 Week <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
            <GlassCard className="ring-2 ring-primary">
              <div className="mb-2"><span className="badge-underline badge-orange">Best Value</span></div>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-3">2 Weeks</h3>
              <div className="mb-4">
                <span className="font-serif text-4xl font-bold text-primary">15,000</span>
                <span className="text-on-surface-variant text-sm ml-1">THB</span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> 14 nights in a standard room</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Unlimited group training</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Electricity included</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Wi-Fi</li>
              </ul>
              <Link href="/booking/camp-stay?package=camp-stay-2weeks" className="btn-primary w-full justify-center">
                Book 2 Weeks <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-3">1 Month - Room</h3>
              <div className="mb-4">
                <span className="font-serif text-4xl font-bold text-primary">18,000</span>
                <span className="text-on-surface-variant text-sm ml-1">THB</span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> 30 nights in a standard room</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Unlimited group training</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Wi-Fi</li>
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
                <span className="font-serif text-4xl font-bold text-primary">23,000</span>
                <span className="text-on-surface-variant text-sm ml-1">THB</span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> 30 nights in the private bungalow</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> King bed, kitchenette, private terrace</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Unlimited group training</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Wi-Fi</li>
                <li className="flex items-center gap-2 opacity-50"><Check size={16} className="shrink-0" aria-hidden="true" /> Electricity charged separately</li>
              </ul>
              <Link href="/booking/camp-stay?package=camp-stay-bungalow-monthly" className="btn-primary w-full justify-center">
                Book Bungalow <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Fighter Program + Stay */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">
              FIGHTER + STAY
            </span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-4">
            Fighter Program + Accommodation
          </h2>
          <p className="text-center text-on-surface-variant text-sm mb-10 max-w-2xl mx-auto">
            Fighter program combined with a monthly stay. Two tiers: standard room or the unique private bungalow.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-3">Fighter + Room</h3>
              <div className="mb-4">
                <span className="font-serif text-4xl font-bold text-primary">20,000</span>
                <span className="text-on-surface-variant text-sm ml-1">THB/month</span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> 2x/day training, yoga, ice bath</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Fight organization + support</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> 30 nights in a standard room</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Wi-Fi</li>
                <li className="flex items-center gap-2 opacity-50"><Check size={16} className="shrink-0" aria-hidden="true" /> Electricity charged separately</li>
              </ul>
              <Link href="/booking/fighter?package=fighter-stay-room-monthly" className="btn-primary w-full justify-center">
                Book Now <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
            <GlassCard>
              <div className="mb-2"><span className="badge-underline badge-orange">Unique - 1 on-site</span></div>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-3">Fighter + Bungalow</h3>
              <div className="mb-4">
                <span className="font-serif text-4xl font-bold text-primary">25,500</span>
                <span className="text-on-surface-variant text-sm ml-1">THB/month</span>
              </div>
              <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> 2x/day training, yoga, ice bath</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> Fight organization + support</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> 30 nights in the private bungalow</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" aria-hidden="true" /> King bed, kitchenette, private terrace</li>
                <li className="flex items-center gap-2 opacity-50"><Check size={16} className="shrink-0" aria-hidden="true" /> Electricity charged separately</li>
              </ul>
              <Link href="/booking/fighter" className="btn-primary w-full justify-center">
                Apply Now <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Special requests + bank transfer */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 rounded-[var(--radius-card)] border-2 border-primary/30 bg-primary/5 p-6">
            <MessageCircle
              size={28}
              className="text-primary shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                Special request or bank transfer?
              </h3>
              <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed mb-3">
                Custom dates, longer stay, group of friends, or you would rather pay by bank transfer (Wise or international wire) instead of card? Contact us directly on WhatsApp and we will set it up.
              </p>
              <a
                href={buildWhatsAppUrl(
                  "Hi, I have a question about accommodation at Plai Laem camp.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-dim font-semibold inline-flex items-center gap-1 text-sm"
              >
                WhatsApp {CAMP_WHATSAPP_DISPLAY}
                <span className="btn-arrow">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Stay On-Site */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">
              WHY STAY HERE
            </span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            Why Stay On-Site
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <GlassCard key={benefit.title} number={String(i + 1).padStart(2, "0")}>
                <benefit.icon size={28} className="text-primary mb-3" aria-hidden="true" />
                <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                  {benefit.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Chor Ratchawat Muay Thai offers on-site accommodation at its{" "}
            <Link
              href="/camps/plai-laem"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              Plai Laem camp
            </Link>{" "}
            in Koh Samui. The camp has 7 standard rooms and 1 private bungalow. Standard rooms include a double bed, private bathroom, air conditioning, Wi-Fi, and a private balcony with pool view. The private bungalow adds a king-size bed, a fitted kitchenette, a living and dining area, and a private terrace over the shared pool. Camp Stay packages start at 8,000 THB per week for a room and 23,000 THB per month for the bungalow, and combine unlimited group training with accommodation in one price. Fighters can combine the{" "}
            <Link
              href="/programs/fighter"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              Fighter Program
            </Link>{" "}
            with a room (20,000 THB/month) or the bungalow (25,500 THB/month). See full{" "}
            <Link
              href="/pricing"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              pricing
            </Link>{" "}
            for all packages.
          </p>
        </div>
      </section>

      <CTABanner
        title="Book Your Stay"
        description="Training and accommodation, one price. Plai Laem camp, Koh Samui."
        buttonText="Book a Package"
        href="/booking/camp-stay"
        ghostText="View All Prices"
        ghostHref="/pricing"
      />
    </>
  );
}
