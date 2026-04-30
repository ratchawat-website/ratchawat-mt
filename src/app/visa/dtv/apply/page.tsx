import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import DtvApplyForm from "./DtvApplyForm";
import { Suspense } from "react";

export const metadata = generatePageMeta({
  title: "Apply for the DTV Visa | Chor Ratchawat Muay Thai",
  description:
    "Complete your DTV visa application with Chor Ratchawat. Submit your details, pay your 6-month training package, and receive your documents within 24 hours.",
  path: "/visa/dtv/apply",
});

export default function DtvApplyPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "DTV Visa", href: "/visa/dtv" },
          { label: "Apply", href: "/visa/dtv/apply" },
        ]}
      />

      <section className="py-10 sm:py-14 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface">
              Apply for your DTV visa
            </h1>
            <p className="mt-3 text-on-surface-variant text-base sm:text-lg">
              Takes about 5 minutes. We send your documents within 24 hours of payment.
            </p>
          </div>
          <Suspense fallback={null}>
            <DtvApplyForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
