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
      <Navigation isAdmin={isAdmin} />
      <main className="pt-20">{children}</main>
      <Footer />
    </>
  );
}
