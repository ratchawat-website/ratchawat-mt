const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";
const SITE_NAME = "Ratchawat Muay Thai";
const SITE_LANG = "en";

/* ─── Organization ─── */
export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    sameAs: [
      "https://www.facebook.com/Chor.RatchawatMuayThaiGym",
      "https://www.instagram.com/chor.ratchawatmuaythai",
      "https://maps.app.goo.gl/yxkGkZtzkn1Lq48Y9",
      "https://maps.app.goo.gl/fLdyZsRm9r5WRCU86",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+66-63-080-2876",
      contactType: "customer service",
      email: "chor.ratchawat@gmail.com",
      availableLanguage: ["English", "Thai"],
    },
  };
}

/* ─── WebSite ─── */
export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: SITE_LANG,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/* ─── BreadcrumbList ─── */
export function breadcrumbSchema(
  items: { name: string; href: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}

/* ─── FAQPage ─── */
export function faqPageSchema(
  faqs: { question: string; answer: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/* ─── Article (blog) ─── */
export function articleSchema(options: {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  authorName?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: options.title,
    description: options.description,
    url: `${SITE_URL}/blog/${options.slug}`,
    datePublished: options.datePublished,
    dateModified: options.dateModified ?? options.datePublished,
    image: options.image ?? `${SITE_URL}/images/og-default.jpg`,
    author: {
      "@type": "Person",
      name: options.authorName ?? "Ratchawat Muay Thai",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    inLanguage: SITE_LANG,
  };
}

/* ─── SportsActivityLocation (gym) ─── */
export function sportsActivityLocationSchema(options: {
  name: string;
  description?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: { latitude: number; longitude: number };
  telephone: string;
  openingHours?: string[];
  priceRange?: string;
  image?: string;
  url?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: options.name,
    description: options.description,
    url: options.url ?? SITE_URL,
    image: options.image,
    telephone: options.telephone,
    priceRange: options.priceRange ?? "$$",
    address: {
      "@type": "PostalAddress",
      ...options.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: options.geo.latitude,
      longitude: options.geo.longitude,
    },
    openingHoursSpecification: options.openingHours,
  };
}

/* ─── Course (training programs) ─── */
export function courseSchema(options: {
  name: string;
  description: string;
  url?: string;
  provider?: string;
  offers?: {
    price: number;
    priceCurrency?: string;
    availability?: string;
  };
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: options.name,
    description: options.description,
    url: options.url ?? SITE_URL,
    provider: {
      "@type": "Organization",
      name: options.provider ?? SITE_NAME,
      url: SITE_URL,
    },
    ...(options.offers && {
      offers: {
        "@type": "Offer",
        price: options.offers.price,
        priceCurrency: options.offers.priceCurrency ?? "THB",
        availability:
          options.offers.availability ??
          "https://schema.org/InStock",
      },
    }),
  };
}

/* ─── LocalBusiness ─── */
export function localBusinessSchema(options: {
  name: string;
  description?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: { latitude: number; longitude: number };
  telephone: string;
  email?: string;
  openingHours?: string[];
  image?: string;
  url?: string;
  priceRange?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: options.name,
    description: options.description,
    url: options.url ?? SITE_URL,
    image: options.image,
    telephone: options.telephone,
    email: options.email,
    priceRange: options.priceRange ?? "$$",
    address: {
      "@type": "PostalAddress",
      ...options.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: options.geo.latitude,
      longitude: options.geo.longitude,
    },
    ...(options.openingHours && {
      openingHoursSpecification: options.openingHours,
    }),
  };
}

/* ─── OfferCatalog ─── */
export function offerCatalogSchema(options: {
  name: string;
  description?: string;
  offers: {
    name: string;
    price: number;
    priceCurrency?: string;
    description?: string;
    url?: string;
  }[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: options.name,
    description: options.description,
    itemListElement: options.offers.map((offer) => ({
      "@type": "Offer",
      name: offer.name,
      price: offer.price,
      priceCurrency: offer.priceCurrency ?? "THB",
      description: offer.description,
      url: offer.url ?? `${SITE_URL}/pricing`,
      availability: "https://schema.org/InStock",
    })),
  };
}

/* ─── AggregateRating ─── */
export function aggregateRatingSchema(options: {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
  itemName?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: options.itemName ?? SITE_NAME,
    url: SITE_URL,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: options.ratingValue,
      reviewCount: options.reviewCount,
      bestRating: options.bestRating ?? 10,
      worstRating: options.worstRating ?? 1,
    },
  };
}
