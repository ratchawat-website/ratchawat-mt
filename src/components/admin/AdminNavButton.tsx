"use client";

import Link from "next/link";
import { Lock, LayoutDashboard } from "lucide-react";

interface Props {
  isAdmin: boolean;
}

export default function AdminNavButton({ isAdmin }: Props) {
  return (
    <Link
      href={isAdmin ? "/admin/bookings" : "/admin/login"}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
        isAdmin
          ? "text-primary hover:bg-primary/10"
          : "text-on-surface-variant/50 hover:text-on-surface-variant hover:bg-surface-lowest"
      }`}
      title={isAdmin ? "Admin Dashboard" : "Admin"}
      aria-label={isAdmin ? "Admin Dashboard" : "Admin login"}
    >
      {isAdmin ? <LayoutDashboard size={16} /> : <Lock size={14} />}
    </Link>
  );
}
