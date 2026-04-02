import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import CTABanner from "@/components/ui/CTABanner";
import JsonLd from "@/components/seo/JsonLd";
import {
  organizationSchema,
  aggregateRatingSchema,
} from "@/components/seo/SchemaOrg";
import { Star, Quote } from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Reviews | Ratchawat Muay Thai Koh Samui \u2014 Rated 9.3/10",
  description:
    "Read reviews from Ratchawat Muay Thai students. Rated 9.3/10 on MuayThaiMap with 131+ Google reviews. See what makes us the top-rated gym.",
  path: "/reviews",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const scores = [
  { category: "Training", score: 9.5 },
  { category: "Ambiance", score: 9.6 },
  { category: "Value", score: 9.1 },
  { category: "Facilities", score: 9.0 },
  { category: "Accessibility", score: 9.2 },
];

const reviews = [
  {
    name: "Sarah M.",
    country: "Australia",
    text: "I trained here for two weeks with zero experience. Kroo Wat was incredibly patient. By the end I could actually hold pads and throw proper combos. The gym is small but that is what makes it feel personal.",
    rating: 10,
  },
  {
    name: "Thomas L.",
    country: "France",
    text: "Deuxieme fois que je viens. L'ambiance est toujours aussi bonne. Les entraineurs se souviennent de vous et adaptent le training a votre niveau. Pas un gym touristique, un vrai gym.",
    rating: 9,
  },
  {
    name: "Jake R.",
    country: "UK",
    text: "Trained at a few gyms in Thailand. This one felt the most honest. No upselling, no hard sell on packages. Just good training with good people. Kong's clinch sessions are worth the trip alone.",
    rating: 10,
  },
  {
    name: "Yuki T.",
    country: "Japan",
    text: "My kids loved it. They trained in the morning class while I did the adult session. Nangja is great with children. We came for 3 days and ended up staying 2 weeks.",
    rating: 9,
  },
  {
    name: "Carlos P.",
    country: "Spain",
    text: "Vine a prepararme para una pelea. El programa de fighter es serio. Dos sesiones al dia, sparring real, y los entrenadores saben lo que hacen. Gane mi pelea en Samui.",
    rating: 10,
  },
  {
    name: "Emma K.",
    country: "Germany",
    text: "As a woman traveling solo, I was nervous about walking into a Muay Thai gym. Within 10 minutes that was gone. The trainers are respectful, the other students are friendly, and having a female trainer makes a difference.",
    rating: 9,
  },
];

const reviewSchemas = reviews.map((r) => ({
  "@context": "https://schema.org",
  "@type": "Review",
  author: { "@type": "Person", name: r.name },
  reviewBody: r.text,
  reviewRating: {
    "@type": "Rating",
    ratingValue: r.rating,
    bestRating: 10,
    worstRating: 1,
  },
  itemReviewed: {
    "@type": "SportsActivityLocation",
    name: "Chor Ratchawat Muay Thai Gym",
    url: SITE_URL,
  },
}));

export default function ReviewsPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          aggregateRatingSchema({
            ratingValue: 9.3,
            reviewCount: 131,
            bestRating: 10,
            worstRating: 1,
          }),
          ...reviewSchemas,
        ]}
      />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Reviews" }]}
      />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">REVIEWS</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface">
            What Our Students Say
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            9.3 out of 10 on MuayThaiMap. 131 Google reviews. Here is what people actually wrote.
          </p>
        </div>
      </section>

      {/* Scores */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {scores.map((s) => (
              <GlassCard key={s.category} hover={false} className="text-center">
                <p className="font-serif text-3xl font-bold text-primary">
                  {s.score}
                </p>
                <p className="text-on-surface-variant text-xs uppercase tracking-wider mt-1">
                  {s.category}
                </p>
              </GlassCard>
            ))}
          </div>
          <p className="mt-4 text-on-surface-variant text-sm text-center">
            Scores from MuayThaiMap based on 131 Google reviews. Scale: 1 to 10.
          </p>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">TESTIMONIALS</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            Student Reviews
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <GlassCard key={review.name} hover={false}>
                <Quote size={24} className="text-primary/40 mb-3" />
                <p className="text-[#ccc] italic text-xs leading-relaxed mb-4">
                  {review.text}
                </p>
                <div className="border-t border-outline-variant pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-on-surface font-semibold text-sm">
                      {review.name}
                    </p>
                    <p className="text-on-surface-variant text-xs">
                      {review.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-primary fill-primary" />
                    <span className="text-on-surface font-bold text-sm">
                      {review.rating}/10
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Tags */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4"><span className="w-8 h-[2px] bg-primary" /><span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">HIGHLIGHTS</span><span className="w-8 h-[2px] bg-primary" /></div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
            What Reviewers Mention Most
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Beginner friendly",
              "Female friendly",
              "Kid friendly",
              "English speaking",
              "Patient trainers",
              "Authentic atmosphere",
              "Good value",
              "Family run",
              "Clean gym",
              "Friendly students",
            ].map((tag) => (
              <span
                key={tag}
                className="badge-underline badge-neutral"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto text-center space-y-3 text-on-surface-variant text-base">
          <p>
            Learn more{" "}
            <Link href="/about" className="text-primary hover:text-primary-dim transition-colors font-medium">about us</Link>
            {" "}or see our{" "}
            <Link href="/programs" className="text-primary hover:text-primary-dim transition-colors font-medium">training programs</Link>.
          </p>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Chor Ratchawat Muay Thai is rated 9.3 out of 10 on MuayThaiMap, based on 131 Google reviews. Scores: Training 9.5/10, Facilities 9.0/10, Ambiance 9.6/10, Value 9.1/10, Accessibility 9.2/10. The gym is recognized as beginner-friendly, female-friendly, and kid-friendly with English-speaking trainers.
          </p>
        </div>
      </section>

      <CTABanner
        title="See for Yourself"
        description="Drop-in from 500 THB. Most people come back."
        buttonText="Book Now"
        href="/booking"
        ghostText="View Pricing"
        ghostHref="/pricing"
      />
    </>
  );
}
