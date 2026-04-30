import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import CTABanner from "@/components/ui/CTABanner";
import ContactForm from "@/components/ui/ContactForm";
import LocationCard from "@/components/ui/LocationCard";
import JsonLd from "@/components/seo/JsonLd";
import {
  organizationSchema,
  localBusinessSchema,
} from "@/components/seo/SchemaOrg";
import { Phone, Mail, Clock, MessageCircle } from "lucide-react";
import Link from "next/link";

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-4">
      <span className="w-8 h-[2px] bg-primary" />
      <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">{label}</span>
      <span className="w-8 h-[2px] bg-primary" />
    </div>
  );
}

export const metadata = generatePageMeta({
  title: "Contact Us | Ratchawat Muay Thai - Koh Samui",
  description:
    "Contact Ratchawat Muay Thai Gym in Koh Samui. Phone: +66 63 080 2876. Email: chor.ratchawat@gmail.com. Visit us in Bo Phut or Plai Laem.",
  path: "/contact",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Ratchawat Muay Thai",
  url: `${SITE_URL}/contact`,
  description:
    "Contact Ratchawat Muay Thai Gym in Koh Samui. Two locations in Bo Phut and Plai Laem.",
};

const boPhutBusiness = localBusinessSchema({
  name: "Chor Ratchawat Muay Thai Gym - Bo Phut",
  description:
    "Muay Thai training camp in Bo Phut, Koh Samui. Group classes, private lessons, and kids programs.",
  address: {
    streetAddress: "Soi Sunday, Tambon Bo Put",
    addressLocality: "Ko Samui",
    addressRegion: "Surat Thani",
    postalCode: "84320",
    addressCountry: "TH",
  },
  geo: { latitude: 9.5553391, longitude: 100.0344246 },
  telephone: "+66630802876",
  email: "chor.ratchawat@gmail.com",
  url: `${SITE_URL}/camps/bo-phut`,
  priceRange: "$$",
});

const plaiLaemBusiness = localBusinessSchema({
  name: "Chor Ratchawat Muay Thai Gym - Plai Laem",
  description:
    "Muay Thai training camp in Plai Laem, Koh Samui. Full gym with bodyweight area, group and private classes.",
  address: {
    streetAddress: "20/33 Moo 5, Plai Laem Soi 13, Tambon Bo Put",
    addressLocality: "Ko Samui",
    addressRegion: "Surat Thani",
    postalCode: "84320",
    addressCountry: "TH",
  },
  geo: { latitude: 9.5718233, longitude: 100.0725812 },
  telephone: "+66630802876",
  email: "chor.ratchawat@gmail.com",
  url: `${SITE_URL}/camps/plai-laem`,
  priceRange: "$$",
});

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "+66 63 080 2876",
    href: "tel:+66630802876",
  },
  {
    icon: Mail,
    label: "Email",
    value: "chor.ratchawat@gmail.com",
    href: "mailto:chor.ratchawat@gmail.com",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Message us on WhatsApp",
    href: "https://wa.me/66630802876",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "7:00 AM - 6:30 PM, 6 days/week (closed Sunday)",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          contactPageSchema,
          organizationSchema(),
          boPhutBusiness,
          plaiLaemBusiness,
        ]}
      />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Contact", href: "/contact" }]}
      />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface">
            Contact Us
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Questions about training, booking, or visa support? Reach out and
            we will get back to you quickly.
          </p>
        </div>
      </section>

      {/* Form + Contact Info */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2">
            <GlassCard hover={false}>
              <h3 className="font-serif text-xl font-bold text-on-surface uppercase mb-6">
                Get in Touch
              </h3>
              <ul className="space-y-5">
                {contactInfo.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <item.icon
                      size={20}
                      className="text-primary shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-on-surface-variant text-xs uppercase tracking-wider mb-0.5">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-on-surface text-sm font-medium hover:text-primary transition-colors"
                          target={
                            item.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            item.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-on-surface text-sm font-medium">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t-2 border-outline-variant">
                <p className="text-on-surface-variant text-xs uppercase tracking-wider mb-3">
                  Follow Us
                </p>
                <div className="flex gap-4">
                  <a
                    href="https://www.facebook.com/Chor.RatchawatMuayThaiGym"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-on-surface-variant text-sm hover:text-primary transition-colors"
                  >
                    Facebook
                  </a>
                  <a
                    href="https://www.instagram.com/chor.ratchawatmuaythai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-on-surface-variant text-sm hover:text-primary transition-colors"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Find Us */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <SectionLabel label="Locations" />
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-12">
            Find Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LocationCard
              name="Ratchawat Bo Phut"
              address="Soi Sunday Tambon Bo Put, Ko Samui District, Surat Thani 84320"
              phone="+66 63 080 2876"
              email="chor.ratchawat@gmail.com"
              hours="7:00 AM - 6:30 PM, 6 days/week (closed Sunday)"
              mapEmbedUrl="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3933!2d100.0344246!3d9.5553391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMzMnMTkuMiJOIDEwMMKwMDInMDQuMCJF!5e0!3m2!1sen!2sth!4v1"
              campPageHref="/camps/bo-phut"
            />
            <LocationCard
              name="Ratchawat Plai Laem"
              address="20, 33 หมู่ที่ 5 ปลายแหลม ซอย 13, Tambon Bo Put, Amphoe Ko Samui, Surat Thani 84320"
              phone="+66 63 080 2876"
              email="chor.ratchawat@gmail.com"
              hours="7:00 AM - 6:30 PM, 6 days/week (closed Sunday)"
              mapEmbedUrl="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1966!2d100.0725812!3d9.5718233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMzQnMTguNiJOIDEwMMKwMDQnMjEuMyJF!5e0!3m2!1sen!2sth!4v1"
              campPageHref="/camps/plai-laem"
            />
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Contact Chor Ratchawat Muay Thai Gym in Koh Samui at{" "}
            <a
              href="tel:+66630802876"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              +66 63 080 2876
            </a>{" "}
            or{" "}
            <a
              href="mailto:chor.ratchawat@gmail.com"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              chor.ratchawat@gmail.com
            </a>
            . Two locations:{" "}
            <Link
              href="/camps/bo-phut"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              Bo Phut
            </Link>{" "}
            (Soi Sunday, Tambon Bo Put) and{" "}
            <Link
              href="/camps/plai-laem"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              Plai Laem
            </Link>{" "}
            (Plai Laem Soi 13). Open 6 days a week (closed Sunday), training from 7:00 AM to 6:30 PM.
          </p>
        </div>
      </section>

      <CTABanner
        title="Ready to Train?"
        description="Book your first session at Ratchawat Koh Samui"
        buttonText="Book Now"
        href="/booking"
        ghostText="View Pricing"
        ghostHref="/pricing"
      />
    </>
  );
}
