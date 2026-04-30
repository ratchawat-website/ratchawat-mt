import { Suspense } from "react";
import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import FighterWizard from "./FighterWizard";

export const metadata = generatePageMeta({
  title: "Apply to Fighter Program | Ratchawat Muay Thai Koh Samui",
  description:
    "Apply for the intensive Fighter Program at Ratchawat Koh Samui. Train twice a day, prepare for competition. Accommodation options available.",
  path: "/booking/fighter",
});

export default function FighterBookingPage() {
  return (
    <>
      <JsonLd data={[organizationSchema()]} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Book", href: "/booking" },
          { label: "Fighter Program", href: "/booking/fighter" },
        ]}
      />

      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface uppercase">
            Apply to the Fighter Program
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Info, tier, camp and dates, contact, review.
          </p>
        </div>
      </section>

      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <Suspense
            fallback={
              <div className="h-96 bg-surface-lowest rounded-[var(--radius-card)] animate-pulse" />
            }
          >
            <FighterWizard />
          </Suspense>
        </div>
      </section>
    </>
  );
}
