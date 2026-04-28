import type { NextConfig } from "next";

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
