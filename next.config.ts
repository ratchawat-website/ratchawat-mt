import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LAN devices (real mobile testing) to hit Next.js dev resources like HMR.
  // Dev-only safeguard; no effect on production builds.
  allowedDevOrigins: ["192.168.1.182"],
};

export default nextConfig;
