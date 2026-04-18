import Link from "next/link";
import Stripe from "stripe";
import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPriceById } from "@/content/pricing";
import { CheckCircle, Mail, FileText, Clock } from "lucide-react";
import { formatDateShort } from "@/lib/utils/date-format";

export const metadata = generatePageMeta({
  title: "DTV Application Confirmed | Chor Ratchawat Muay Thai",
  description:
    "Your DTV visa training application with Chor Ratchawat is confirmed. Documents will be emailed within 24 hours.",
  path: "/visa/dtv/confirmed",
  noIndex: true,
});

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

interface DtvSummary {
  id: string;
  packageName: string;
  firstName: string;
  arrivalDate: string;
  trainingStartDate: string;
  amount: number;
}

async function resolveApplication(
  sessionId: string,
): Promise<DtvSummary | null> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const applicationId = session.metadata?.dtv_application_id;
    if (!applicationId) return null;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dtv_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (error || !data) return null;

    const pkg = getPriceById(data.price_id);
    return {
      id: data.id,
      packageName: pkg?.name ?? data.price_id,
      firstName: data.first_name,
      arrivalDate: data.arrival_date,
      trainingStartDate: data.training_start_date,
      amount: data.price_amount,
    };
  } catch (err) {
    console.error("Failed to resolve DTV application:", err);
    return null;
  }
}

export default async function DtvConfirmedPage({ searchParams }: Props) {
  const params = await searchParams;
  const application = params.session_id
    ? await resolveApplication(params.session_id)
    : null;

  return (
    <>
      <JsonLd data={[organizationSchema()]} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Visa" },
          { label: "DTV Visa", href: "/visa/dtv" },
          { label: "Confirmed" },
        ]}
      />

      <section className="py-16 sm:py-24 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle
            size={64}
            className="text-primary mx-auto mb-6"
            aria-hidden="true"
          />
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface uppercase">
            Application received
          </h1>
          {application ? (
            <p className="mt-4 text-on-surface-variant text-lg">
              Thanks {application.firstName}. Your payment is confirmed. Your
              DTV documents will land in your inbox within 24 hours.
            </p>
          ) : (
            <p className="mt-4 text-on-surface-variant text-lg">
              Payment confirmed. Your DTV documents will be sent to you within
              24 hours.
            </p>
          )}
        </div>
      </section>

      {application && (
        <section className="pb-12 px-6 sm:px-10 md:px-16 lg:px-20">
          <div className="max-w-2xl mx-auto">
            <GlassCard hover={false}>
              <h2 className="font-serif text-lg font-bold text-on-surface mb-4 uppercase">
                Your application
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-on-surface-variant">Package</span>
                  <span className="text-on-surface font-medium text-right">
                    {application.packageName}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-on-surface-variant">
                    Arrival in Thailand
                  </span>
                  <span className="text-on-surface font-medium">
                    {formatDateShort(application.arrivalDate)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-on-surface-variant">
                    Training start
                  </span>
                  <span className="text-on-surface font-medium">
                    {formatDateShort(application.trainingStartDate)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-outline-variant">
                  <span className="text-on-surface font-semibold">
                    Total paid
                  </span>
                  <span className="font-serif text-xl font-bold text-primary">
                    {application.amount.toLocaleString("en-US")} THB
                  </span>
                </div>
                <p className="text-on-surface-variant text-xs pt-2">
                  Application ID: {application.id}
                </p>
              </div>
            </GlassCard>
          </div>
        </section>
      )}

      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="font-serif text-xl font-bold text-on-surface mb-4">
            What happens next
          </h2>
          <GlassCard hover={false}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock
                  size={20}
                  className="text-primary shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-on-surface font-medium text-sm">
                    Documents within 24 hours
                  </p>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    We send your official enrollment letter and supporting docs
                    to your email.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText
                  size={20}
                  className="text-primary shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-on-surface font-medium text-sm">
                    Submit your DTV application online
                  </p>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    Use the official Thai e-visa portal{" "}
                    <a
                      href="https://thaievisa.go.th/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-link"
                    >
                      thaievisa.go.th
                    </a>
                    . Upload the documents we send you. The embassy charges a
                    10,000 THB fee, paid on the portal.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail
                  size={20}
                  className="text-primary shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-on-surface font-medium text-sm">
                    Need help?
                  </p>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    WhatsApp us at{" "}
                    <a
                      href="https://wa.me/66630802876"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-link"
                    >
                      +66 63 080 2876
                    </a>
                    {" "}or email chor.ratchawat@gmail.com.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/accommodation" className="btn-primary text-center text-sm">
              Plan your stay
            </Link>
            <Link
              href="/"
              className="text-center text-sm text-on-surface-variant font-medium hover:text-on-surface transition-colors border-2 border-outline-variant rounded-lg px-6 py-3"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
