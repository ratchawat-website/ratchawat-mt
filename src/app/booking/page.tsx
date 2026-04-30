import Link from "next/link";
import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import { Users, User, Swords, Home } from "lucide-react";

export const metadata = generatePageMeta({
  title: "Book Muay Thai Training Online | Ratchawat Koh Samui",
  description:
    "Book group training, private lessons, fighter program, or camp stay at Ratchawat Muay Thai Koh Samui. Instant Stripe payment and email confirmation.",
  path: "/booking",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const bookingSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Book Muay Thai Training",
  url: `${SITE_URL}/booking`,
  potentialAction: {
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/booking`,
    },
    result: {
      "@type": "Reservation",
      name: "Muay Thai Training Session",
    },
  },
};

const bookingTypes = [
  {
    id: "training",
    icon: Users,
    title: "Group Training",
    from: "From 400 THB",
    badge: "Bo Phut or Plai Laem",
    description:
      "Drop in for a single class, train a full week, or commit for a month. Morning and afternoon sessions, six days a week.",
    href: "/booking/training",
    cta: "Book Training",
  },
  {
    id: "private",
    icon: User,
    title: "Private Lessons",
    from: "From 600 THB",
    badge: "Bo Phut or Plai Laem",
    description:
      "One-on-one or small-group sessions for adults and kids. Fully personalized training with a dedicated trainer.",
    href: "/booking/private",
    cta: "Book Private",
  },
  {
    id: "fighter",
    icon: Swords,
    title: "Fighter Program",
    from: "From 9,500 THB / month",
    badge: "Bo Phut or Plai Laem",
    description:
      "For athletes who want to compete. Two sessions a day, six days a week, with fight organization and corner support.",
    href: "/booking/fighter",
    cta: "Apply Now",
  },
  {
    id: "camp-stay",
    icon: Home,
    title: "Camp Stay",
    from: "From 8,000 THB / week",
    badge: "Stay Plai Laem, train any camp",
    description:
      "All-inclusive training and accommodation at Plai Laem. Standard rooms and private bungalows. Train at either camp while staying on site.",
    href: "/booking/camp-stay",
    cta: "Book Camp Stay",
  },
];

export default function BookingPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), bookingSchema]} />

      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Book", href: "/booking" }]} />

      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">
              BOOK ONLINE
            </span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface uppercase">
            Book Your Training
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Four ways to train at Ratchawat. Pick the one that fits you, pay
            securely, get an instant confirmation.
          </p>
        </div>
      </section>

      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookingTypes.map((type, i) => (
            <GlassCard key={type.id} number={String(i + 1).padStart(2, "0")}>
              <div className="flex items-start gap-4 mb-4">
                <type.icon
                  size={32}
                  className="text-primary shrink-0 mt-1"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="font-serif text-xl font-bold text-on-surface uppercase">
                    {type.title}
                  </h2>
                  <p className="text-primary font-semibold text-sm mt-1">
                    {type.from}
                  </p>
                </div>
              </div>
              <span className="inline-block badge-underline badge-neutral mb-4">
                {type.badge}
              </span>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                {type.description}
              </p>
              <Link
                href={type.href}
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:text-primary-dim transition-colors"
              >
                {type.cta} →
              </Link>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Book Muay Thai training, private lessons, fighter program, or full
            camp stays at Ratchawat Koh Samui. Prices start at 400 THB for a
            drop-in class and 8,000 THB for a one-week all-inclusive camp stay
            at Plai Laem with cross-camp training access.
          </p>
        </div>
      </section>
    </>
  );
}
