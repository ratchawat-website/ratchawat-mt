import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import CTABanner from "@/components/ui/CTABanner";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import ReviewsGrid from "@/components/sections/ReviewsGrid";
import { Star } from "lucide-react";
import Link from "next/link";
import {
  reviews,
  CAMP_LABELS,
  CAMP_GBP_URLS,
  CAMP_STATS,
  TOTAL_REVIEWS_DISPLAY,
  OVERALL_RATING,
  reviewHighlightTags,
} from "@/content/reviews";

export const metadata = generatePageMeta({
  title: "Reviews | Ratchawat Muay Thai Koh Samui - 5.0/5, 400+ avis",
  description:
    "5.0 out of 5 stars across 400+ Google reviews. Real student reviews from Ratchawat Muay Thai Bo Phut and Plai Laem camps in Koh Samui.",
  path: "/reviews",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

function campAggregate(camp: "bo-phut" | "plai-laem") {
  const stats = CAMP_STATS[camp];
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: `Chor.Ratchawat Muay Thai ${CAMP_LABELS[camp]}`,
    url: `${SITE_URL}/camps/${camp}`,
    sameAs: CAMP_GBP_URLS[camp],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: stats.rating,
      reviewCount: stats.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

const reviewSchemas = reviews.map((r) => ({
  "@context": "https://schema.org",
  "@type": "Review",
  author: { "@type": "Person", name: r.author },
  datePublished: r.approxDate,
  reviewBody: r.text,
  inLanguage: r.language,
  reviewRating: {
    "@type": "Rating",
    ratingValue: r.rating,
    bestRating: 5,
    worstRating: 1,
  },
  itemReviewed: {
    "@type": "SportsActivityLocation",
    name: `Chor.Ratchawat Muay Thai ${CAMP_LABELS[r.camp]}`,
    url: `${SITE_URL}/camps/${r.camp}`,
    sameAs: CAMP_GBP_URLS[r.camp],
  },
}));

export default function ReviewsPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          campAggregate("bo-phut"),
          campAggregate("plai-laem"),
          ...reviewSchemas,
        ]}
      />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Reviews" }]}
      />

      {/* Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">
              REVIEWS
            </span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface">
            What Our Students Say
          </h1>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={22}
                    className="text-primary fill-primary"
                  />
                ))}
              </div>
              <span className="font-serif text-3xl font-bold text-primary">
                {OVERALL_RATING.toFixed(1)}
              </span>
            </div>
            <span className="text-on-surface-variant text-sm">
              {TOTAL_REVIEWS_DISPLAY} Google reviews across both camps
            </span>
          </div>
          <p className="mt-4 text-on-surface-variant text-base max-w-2xl mx-auto">
            Real, verified reviews from students at Bo Phut and Plai Laem. No edits, no filters, just what people actually wrote on Google.
          </p>
        </div>
      </section>

      {/* Reviews Grid (client component with filter tabs) */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <ReviewsGrid reviews={reviews} />
        </div>
      </section>

      {/* Read more on Google */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-4">
            Read Every Review on Google
          </h2>
          <p className="text-on-surface-variant text-sm mb-6 max-w-2xl mx-auto">
            These are a few. Both camps have hundreds of reviews. Check the full
            list on Google.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={CAMP_GBP_URLS["bo-phut"]}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Bo Phut on Google
            </a>
            <a
              href={CAMP_GBP_URLS["plai-laem"]}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Plai Laem on Google
            </a>
          </div>
        </div>
      </section>

      {/* Highlight tags */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">
              WHAT STUDENTS MENTION
            </span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
            Recurring Themes
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {reviewHighlightTags.map((tag) => (
              <span key={tag} className="badge-underline badge-neutral">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="py-10 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center text-on-surface-variant text-base">
          <p>
            Want to know more?{" "}
            <Link
              href="/programs"
              className="text-primary hover:text-primary-dim transition-colors font-medium"
            >
              See our training programs
            </Link>
            , pick your{" "}
            <Link
              href="/camps/bo-phut"
              className="text-primary hover:text-primary-dim transition-colors font-medium"
            >
              Bo Phut
            </Link>{" "}
            or{" "}
            <Link
              href="/camps/plai-laem"
              className="text-primary hover:text-primary-dim transition-colors font-medium"
            >
              Plai Laem
            </Link>{" "}
            camp, or check the{" "}
            <Link
              href="/pricing"
              className="text-primary hover:text-primary-dim transition-colors font-medium"
            >
              pricing
            </Link>
            .
          </p>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Chor Ratchawat Muay Thai in Koh Samui is rated 5.0 out of 5 stars on
            Google across both Bo Phut and Plai Laem camps, with {TOTAL_REVIEWS_DISPLAY}{" "}
            verified Google reviews in total. Students repeatedly mention
            patient trainers, beginner-friendly classes, clean facilities, and
            a welcoming international community.
          </p>
        </div>
      </section>

      <CTABanner
        title="See for Yourself"
        description="Drop-in from 400 THB. Most people come back."
        buttonText="Book Now"
        href="/booking"
        ghostText="View Pricing"
        ghostHref="/pricing"
      />
    </>
  );
}
