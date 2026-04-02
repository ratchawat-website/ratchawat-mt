import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import CTABanner from "@/components/ui/CTABanner";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Gallery | Ratchawat Muay Thai Koh Samui \u2014 Photos & Videos",
  description:
    "Photos and videos from Ratchawat Muay Thai in Koh Samui. See our gyms, training sessions, fighters, and camp atmosphere.",
  path: "/gallery",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const gallerySchema = {
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  name: "Ratchawat Muay Thai Gallery",
  url: `${SITE_URL}/gallery`,
  description: "Photos and videos from Ratchawat Muay Thai gym in Koh Samui, Thailand.",
  about: {
    "@type": "Organization",
    name: "Chor Ratchawat Muay Thai Gym",
    url: SITE_URL,
  },
};

const categories = [
  {
    title: "Bo Phut Camp",
    placeholderCategory: "gym" as const,
    count: 4,
    alt: "Muay Thai training at Ratchawat Bo Phut Koh Samui",
  },
  {
    title: "Plai Laem Camp",
    placeholderCategory: "gym" as const,
    count: 4,
    alt: "Muay Thai gym Ratchawat Plai Laem Koh Samui",
  },
  {
    title: "Training Sessions",
    placeholderCategory: "training" as const,
    count: 6,
    alt: "Muay Thai group training at Ratchawat Koh Samui",
  },
  {
    title: "Our Team",
    placeholderCategory: "team" as const,
    count: 4,
    alt: "Muay Thai trainers at Ratchawat Koh Samui",
  },
];

export default function GalleryPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), gallerySchema]} />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-on-surface">
            Gallery
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            What the gym looks like. Real photos coming soon. For now, placeholders show the layout.
          </p>
        </div>
      </section>

      {/* Gallery Sections */}
      {categories.map((cat, catIndex) => (
        <section
          key={cat.title}
          className={`py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 ${
            catIndex % 2 === 1 ? "bg-surface-lowest/50" : ""
          }`}
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-on-surface mb-8">
              {cat.title}
            </h2>
            <div className={`grid gap-4 ${
              cat.count === 6
                ? "grid-cols-2 sm:grid-cols-3"
                : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
            }`}>
              {Array.from({ length: cat.count }).map((_, i) => (
                <ImagePlaceholder
                  key={i}
                  category={cat.placeholderCategory}
                  aspectRatio={i === 0 && cat.count === 4 ? "aspect-video" : "aspect-square"}
                  className={i === 0 && cat.count === 4 ? "col-span-2" : ""}
                />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Info */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed mb-4">
            Want to see more? Follow us on{" "}
            <a
              href="https://www.instagram.com/chor.ratchawatmuaythai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dim transition-colors font-medium"
            >
              Instagram
            </a>
            {" "}and{" "}
            <a
              href="https://www.tiktok.com/@chor.ratchawat"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dim transition-colors font-medium"
            >
              TikTok
            </a>
            {" "}for daily training videos and updates.
          </p>
          <p className="text-on-surface-variant text-base">
            Read more{" "}
            <Link href="/about" className="text-primary hover:text-primary-dim transition-colors font-medium">about us</Link>
            {" "}or check out the{" "}
            <Link href="/camps/bo-phut" className="text-primary hover:text-primary-dim transition-colors font-medium">Bo Phut</Link>
            {" "}and{" "}
            <Link href="/camps/plai-laem" className="text-primary hover:text-primary-dim transition-colors font-medium">Plai Laem</Link>
            {" "}camp pages.
          </p>
        </div>
      </section>

      <CTABanner
        title="Come See It in Person"
        description="Drop-in from 500 THB. Two camps, all levels, six days a week."
        buttonText="Book Now"
        href="/booking"
      />
    </>
  );
}
