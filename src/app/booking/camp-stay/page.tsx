import { Suspense } from "react";
import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import CampStayWizard from "./CampStayWizard";

export const metadata = generatePageMeta({
  title: "Book Camp Stay | Ratchawat Muay Thai Koh Samui",
  description:
    "All-inclusive Muay Thai training plus accommodation at Plai Laem. Rooms and bungalows. Train at both camps.",
  path: "/booking/camp-stay",
});

export default function CampStayBookingPage() {
  return (
    <>
      <JsonLd data={[organizationSchema()]} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Book", href: "/booking" },
          { label: "Camp Stay" },
        ]}
      />

      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface uppercase">
            Book Camp Stay
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Package, check-in date, contact, review. Stay at Plai Laem and
            train at either camp.
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
            <CampStayWizard />
          </Suspense>
        </div>
      </section>
    </>
  );
}
