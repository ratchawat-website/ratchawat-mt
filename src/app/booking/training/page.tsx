import { Suspense } from "react";
import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import TrainingWizard from "./TrainingWizard";

export const metadata = generatePageMeta({
  title: "Book Group Training | Ratchawat Muay Thai Koh Samui",
  description:
    "Book your Muay Thai group training at Ratchawat Koh Samui. Drop-in, weekly, or monthly packages. Bo Phut or Plai Laem camps.",
  path: "/booking/training",
});

export default function TrainingBookingPage() {
  return (
    <>
      <JsonLd data={[organizationSchema()]} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Book", href: "/booking" },
          { label: "Group Training" },
        ]}
      />

      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-on-surface uppercase">
            Book Group Training
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Pick a package, choose your camp, set a date, and confirm. Five
            quick steps.
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
            <TrainingWizard />
          </Suspense>
        </div>
      </section>
    </>
  );
}
