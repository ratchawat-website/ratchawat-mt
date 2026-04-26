"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import Footer from "./Footer";

interface Props {
  isAdmin: boolean;
  children: React.ReactNode;
}

export default function ConditionalLayout({ isAdmin, children }: Props) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-primary focus:text-on-primary focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold focus:text-sm focus:outline-2 focus:outline-on-primary focus:outline-offset-2"
      >
        Skip to main content
      </a>
      <Navigation isAdmin={isAdmin} />
      <main id="main-content" tabIndex={-1} className="pt-20">
        {children}
      </main>
      <Footer />
    </>
  );
}
