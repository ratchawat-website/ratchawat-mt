import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";

import "@/styles/globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-barlow-condensed",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com",
  ),
  title: {
    default:
      "Muay Thai Koh Samui | Chor Ratchawat - Bo Phut & Plai Laem",
    template: "%s | Ratchawat Muay Thai",
  },
  description:
    "Train Muay Thai at Chor Ratchawat Gym in Koh Samui. Two locations in Bo Phut & Plai Laem. Group, private & kids classes. Book online today.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Ratchawat Muay Thai",
  },
  twitter: {
    card: "summary_large_image",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isAdmin = false;

  try {
    // Dynamic import to avoid build errors when Supabase is not configured
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.rpc("is_admin");
        isAdmin = !!data;
      }
    }
  } catch {
    // Silently fail — non-admin is the safe default
  }

  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body className="bg-[#0a0a0a]">
        <ConditionalLayout isAdmin={isAdmin}>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
