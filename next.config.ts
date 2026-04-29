import type { NextConfig } from "next";

// Content Security Policy. 'unsafe-inline' on script-src is required because
// inline JSON-LD <script> tags are emitted on most pages (see JsonLd.tsx,
// which already escapes "<" to neutralise breakout). Switching to nonces
// would require reading the nonce from a request-scoped store on every
// Server Component render and is not justified on this site.
//
// In dev, Turbopack's HMR runtime needs string evaluation to hot-replace
// React Server Components, so we relax script-src locally only. Production
// builds keep the strict policy.
const isDev = process.env.NODE_ENV !== "production";
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(isDev ? ["'unsafe-eval'"] : []),
  "https://js.stripe.com",
  "https://challenges.cloudflare.com",
].join(" ");

const cspDirectives = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://api.stripe.com https://challenges.cloudflare.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: cspDirectives },
];

// Permanent 301 redirects from the legacy WordPress URL structure.
// Targets that no longer exist on the new site are routed to the closest
// equivalent: removed /services pages -> /programs; removed /blog -> /.
const wordpressRedirects = [
  { source: "/about-us", destination: "/about" },
  { source: "/bo-phut", destination: "/camps/bo-phut" },
  { source: "/plai-laem", destination: "/camps/plai-laem" },
  { source: "/group-lessons-adults", destination: "/programs/group-adults" },
  { source: "/group-lessons-kids", destination: "/programs/group-kids" },
  { source: "/private-lessons", destination: "/programs/private" },
  { source: "/train-to-fight", destination: "/programs/fighter" },
  { source: "/schedule-bo-phut", destination: "/camps/bo-phut" },
  { source: "/schedule-plai-laem", destination: "/camps/plai-laem" },
  { source: "/accomodation", destination: "/accommodation" },
  { source: "/accomodation-plai-laem", destination: "/accommodation" },
  { source: "/training", destination: "/programs" },
  { source: "/services", destination: "/programs" },
  { source: "/transportation-solutions", destination: "/contact" },
  { source: "/health-insurance", destination: "/contact" },
  { source: "/dtv-visa-thailand-apply-now", destination: "/visa/dtv" },
  { source: "/destination-thailand-visa-dtv-form", destination: "/visa/dtv/apply" },
  { source: "/90-days-muay-thai-visa-apply-now", destination: "/visa/dtv" },
  { source: "/90-days-muay-thai-visa-form", destination: "/visa/dtv/apply" },
  { source: "/camp-news", destination: "/" },
  { source: "/blognews", destination: "/" },
  { source: "/category/news", destination: "/" },
  // Legacy /gallery removed in Phase 5; photos now on Instagram/Facebook
  { source: "/gallery", destination: "/" },
];

const nextConfig: NextConfig = {
  // Allow LAN devices (real mobile testing) to hit Next.js dev resources like HMR.
  // Dev-only safeguard; no effect on production builds.
  allowedDevOrigins: ["192.168.1.182"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return wordpressRedirects.flatMap((r) => [
      // Match without trailing slash
      { source: r.source, destination: r.destination, permanent: true },
      // Match with trailing slash (WordPress default)
      { source: `${r.source}/`, destination: r.destination, permanent: true },
    ]);
  },
};

export default nextConfig;
