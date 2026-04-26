import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import CTABanner from "@/components/ui/CTABanner";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import TeamGrid from "@/components/sections/TeamGrid";
import Image from "next/image";
import Link from "next/link";
import {
  trainers,
  featuredTrainer,
  teamMembers,
  trainerCampLabel,
} from "@/content/trainers";
import { TOTAL_REVIEWS, OVERALL_RATING } from "@/content/reviews";

export const metadata = generatePageMeta({
  title: "Muay Thai Trainers Koh Samui | Ratchawat - 10 Thai Coaches",
  description:
    "Meet the Ratchawat Muay Thai team. 10 Thai trainers across our Bo Phut and Plai Laem camps. Led by founder Kru Ratchawat. All levels welcome.",
  path: "/team",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const trainerSchemas = trainers.map((t) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: t.name,
  jobTitle: t.role,
  description: t.bio,
  worksFor: {
    "@type": "Organization",
    name: "Chor Ratchawat Muay Thai Gym",
    url: SITE_URL,
  },
  knowsAbout: t.specialties,
  workLocation: t.camps.map((c) => ({
    "@type": "Place",
    name: `Chor.Ratchawat Muay Thai ${c === "bo-phut" ? "Bo Phut" : "Plai Laem"}`,
    url: `${SITE_URL}/camps/${c}`,
  })),
}));

export default function TeamPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), ...trainerSchemas]} />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Team" }]}
      />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">
              THE TEAM
            </span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface">
            Meet the Trainers
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Ten Thai trainers across our Bo Phut and Plai Laem camps. All
            fighters or ex-fighters. All teaching in English. They are the
            reason students keep coming back.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-on-surface-variant text-sm">
            <span>
              <strong className="text-primary font-bold">{trainers.length}</strong>{" "}
              trainers
            </span>
            <span className="opacity-40">·</span>
            <span>
              <strong className="text-primary font-bold">2</strong> camps
            </span>
            <span className="opacity-40">·</span>
            <span>
              <strong className="text-primary font-bold">
                {OVERALL_RATING.toFixed(1)}/5
              </strong>{" "}
              on {TOTAL_REVIEWS} Google reviews
            </span>
          </div>
        </div>
      </section>

      {/* Founder — Featured Hero Card */}
      {featuredTrainer && (
        <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-card bg-surface-lowest border-l-2 border-l-primary border-b-2 border-b-outline-variant shadow-card">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                <div className="lg:col-span-2 relative aspect-[4/5] lg:aspect-auto lg:min-h-[520px]">
                  {featuredTrainer.image ? (
                    <Image
                      src={featuredTrainer.image}
                      alt={featuredTrainer.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                      style={{ objectPosition: featuredTrainer.pos ?? "center" }}
                      priority
                    />
                  ) : (
                    <div
                      aria-label={featuredTrainer.imageAlt}
                      role="img"
                      className="absolute inset-0 bg-gradient-to-br from-slate-800 via-gray-900 to-zinc-800"
                    />
                  )}
                </div>
                <div className="lg:col-span-3 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-[2px] bg-primary" />
                    <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">
                      FOUNDER
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface uppercase mb-2">
                    {featuredTrainer.name}
                  </h2>
                  <p className="mb-5">
                    <span className="badge-underline badge-orange">
                      {featuredTrainer.role}
                    </span>
                    <span className="badge-underline badge-neutral ml-2 text-[10px]">
                      {trainerCampLabel(featuredTrainer)}
                    </span>
                  </p>
                  <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed mb-6">
                    {featuredTrainer.bio}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {featuredTrainer.specialties.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] uppercase tracking-wider px-3 py-1 rounded border border-outline-variant text-on-surface-variant"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Team Grid */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">
              THE TRAINERS
            </span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-4">
            The Team
          </h2>
          <p className="text-on-surface-variant text-sm text-center mb-2 max-w-2xl mx-auto">
            Filter by camp to see who teaches where. Many trainers rotate between
            both camps.
          </p>
          <TeamGrid trainers={teamMembers} />
        </div>
      </section>

      {/* How we train */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">
              HOW WE TRAIN
            </span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-6">
            Small Team. Personal Attention.
          </h2>
          <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              Ratchawat is a family-run camp. No agencies, no rotating contract
              staff. Our trainers stay for years, which means they remember your
              name and your progress between visits.
            </p>
            <p>
              In group classes you rotate through trainers depending on the day.
              For{" "}
              <Link
                href="/programs/private"
                className="text-primary hover:text-primary-dim transition-colors font-medium"
              >
                private lessons
              </Link>
              , you can request a specific trainer when booking. Tell us what
              you want to work on and we match you.
            </p>
            <p>
              Want to know more about the gym?{" "}
              <Link
                href="/about"
                className="text-primary hover:text-primary-dim transition-colors font-medium"
              >
                Read our story
              </Link>
              , or check the{" "}
              <Link
                href="/programs/fighter"
                className="text-primary hover:text-primary-dim transition-colors font-medium"
              >
                fighter program
              </Link>{" "}
              if you are serious about competing.
            </p>
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            The Ratchawat Muay Thai team in Koh Samui includes 10 Thai trainers
            across two camps, led by founder Kru Ratchawat. The roster: Kru
            Ratchawat (Founder), Kru Kuan (Head Trainer Bo Phut), Kru Mam, Kru
            Kit, Kru Kheng, Kru Dam, Kru Tae, Kru Sing, Kru Jet, and Kru Tan
            (Kids Instructor). The team teaches group classes, private 1-on-1
            sessions, kids programs, and fighter preparation in English at both
            the Bo Phut and Plai Laem camps.
          </p>
        </div>
      </section>

      <CTABanner
        title="Train With Our Team"
        description="Group classes or private 1-on-1 sessions with any trainer."
        buttonText="Book Now"
        href="/booking"
        ghostText="View Pricing"
        ghostHref="/pricing"
      />
    </>
  );
}
