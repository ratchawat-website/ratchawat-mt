import { Suspense } from "react";
import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import BookingWidget from "./BookingWidget";

export const metadata = generatePageMeta({
  title: "Book Muay Thai Classes Online | Ratchawat Koh Samui",
  description:
    "Book and pay for Muay Thai classes online at Ratchawat Koh Samui. Select your camp, program & schedule. Instant confirmation via email.",
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

export default function BookingPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), bookingSchema]} />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Book" }]}
      />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface uppercase">
            Book Your Training
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Pick your package, choose your camp, select a date. Pay online, get instant confirmation.
          </p>
        </div>
      </section>

      {/* Booking Widget */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <Suspense fallback={<div className="h-96 bg-surface-lowest rounded-[var(--radius-card)] animate-pulse" />}>
            <BookingWidget />
          </Suspense>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Book Muay Thai classes online at Ratchawat Koh Samui. Select Bo Phut or Plai Laem camp, choose group or private lessons, pick your schedule, and pay securely via Stripe. Instant email confirmation.
          </p>
        </div>
      </section>
    </>
  );
}
