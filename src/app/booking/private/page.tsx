import { Suspense } from "react";
import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import PrivateWizard from "./PrivateWizard";

export const metadata = generatePageMeta({
  title: "Book Private Lessons | Ratchawat Muay Thai Koh Samui",
  description:
    "Book one-on-one or small-group private Muay Thai lessons at Ratchawat Koh Samui. Adults and kids. Bo Phut or Plai Laem.",
  path: "/booking/private",
});

export default function PrivateBookingPage() {
  return (
    <>
      <JsonLd data={[organizationSchema()]} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Book", href: "/booking" },
          { label: "Private Lessons", href: "/booking/private" },
        ]}
      />

      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface uppercase">
            Book Private Lessons
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Session type, camp, date and time, contact, review.
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
            <PrivateWizard />
          </Suspense>
        </div>
      </section>
    </>
  );
}
