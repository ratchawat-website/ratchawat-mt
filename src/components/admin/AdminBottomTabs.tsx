"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, CalendarDays, FileText, User } from "lucide-react";

const tabs = [
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/availability", label: "Availability", icon: CalendarDays },
  { href: "/admin/dtv-applications", label: "DTV", icon: FileText },
  { href: "/admin/account", label: "Account", icon: User },
];

export default function AdminBottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t-2 border-outline-variant">
      <div className="flex justify-around py-2">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-4 py-1 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                active ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
