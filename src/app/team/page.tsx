import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import CTABanner from "@/components/ui/CTABanner";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Our Trainers | Ratchawat Muay Thai Koh Samui \u2014 Meet the Team",
  description:
    "Meet the trainers at Ratchawat Muay Thai Koh Samui. Experienced Thai coaches including Kroo Wat, Mam, Kong & Teacher Nangja.",
  path: "/team",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const trainers = [
  {
    name: "Kroo Wat",
    jobTitle: "Head Trainer & Founder",
    bio: "Kroo Wat built Ratchawat from the ground up. He started the Bo Phut gym and still teaches there every day. Calm, patient, technically precise. He can break down a technique for a first-timer and then push an experienced fighter in the same hour. Students keep coming back because of him.",
    specialties: ["Pad work", "Technique", "Fight preparation"],
  },
  {
    name: "Mam",
    jobTitle: "Trainer",
    bio: "Mam is fast. Fast hands, fast eyes. She spots mistakes before you finish the combination. Good at breaking things down step by step, especially for students who are still building muscle memory. Popular with beginners and intermediate students.",
    specialties: ["Technique drills", "Combinations", "Beginners"],
  },
  {
    name: "Kong",
    jobTitle: "Trainer",
    bio: "Kong is the clinch specialist. If you want to learn the inside game (knees, elbows, sweeps, off-balancing), he is the one to train with. Strong, technical, and surprisingly gentle when teaching newcomers. Also runs conditioning sessions.",
    specialties: ["Clinch", "Knees & elbows", "Conditioning"],
  },
  {
    name: "Teacher Nangja",
    jobTitle: "Trainer & Fighter",
    bio: "Nangja is the youngest on the team and still fights actively. She brings that ring energy to training. Good with kids classes and with students who want to push their cardio and intensity. She competes in local events on Koh Samui.",
    specialties: ["Kids classes", "Cardio intensity", "Competition prep"],
  },
];

const trainerSchemas = trainers.map((t) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: t.name,
  jobTitle: t.jobTitle,
  worksFor: {
    "@type": "Organization",
    name: "Chor Ratchawat Muay Thai Gym",
    url: SITE_URL,
  },
  knowsAbout: t.specialties,
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
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-on-surface">
            Our Team
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Four trainers. All Thai, all fighters, all teaching in English. They are the reason people come back.
          </p>
        </div>
      </section>

      {/* Trainer Profiles */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto space-y-12">
          {trainers.map((trainer, index) => (
            <div
              key={trainer.name}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-start ${
                index % 2 === 1 ? "lg:direction-rtl" : ""
              }`}
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <ImagePlaceholder category="team" aspectRatio="aspect-[4/5]" />
              </div>
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-on-surface mb-1">
                  {trainer.name}
                </h2>
                <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-4">
                  {trainer.jobTitle}
                </p>
                <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed mb-4">
                  {trainer.bio}
                </p>
                <div className="flex flex-wrap gap-2">
                  {trainer.specialties.map((s) => (
                    <span
                      key={s}
                      className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Train With Them */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-on-surface mb-6">
            Train With Them
          </h2>
          <div className="space-y-4 text-on-surface-variant text-base sm:text-lg leading-relaxed">
            <p>
              All four trainers teach at both camps. In group classes, you will rotate through different trainers depending on the day. For{" "}
              <Link href="/programs/private" className="text-primary hover:text-primary-dim transition-colors font-medium">private lessons</Link>
              , you can request a specific trainer when booking.
            </p>
            <p>
              Want to know more about the gym itself? Read{" "}
              <Link href="/about" className="text-primary hover:text-primary-dim transition-colors font-medium">our story</Link>
              {" "}or check out the{" "}
              <Link href="/programs/fighter" className="text-primary hover:text-primary-dim transition-colors font-medium">fighter program</Link>
              {" "}if you are serious about competing.
            </p>
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Ratchawat Muay Thai&apos;s training team in Koh Samui includes Kroo Wat (head trainer), Mam, Kong, and Teacher Nangja. All trainers are experienced Thai fighters and coaches who teach in English. The team is known for patient, personalized instruction suitable for all levels.
          </p>
        </div>
      </section>

      <CTABanner
        title="Train With Our Team"
        description="Group classes or private 1-on-1 sessions. Your pick."
        buttonText="Book Now"
        href="/booking"
      />
    </>
  );
}
