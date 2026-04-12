import Link from "next/link";
import AdminSidebar from "./AdminSidebar";
import AdminBottomTabs from "./AdminBottomTabs";
import AdminUserMenu from "./AdminUserMenu";

interface Props {
  email: string;
  children: React.ReactNode;
}

export default function AdminShell({ email, children }: Props) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <header className="sticky top-0 z-40 h-14 bg-surface border-b-2 border-outline-variant flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bookings"
            className="font-serif text-base font-semibold text-on-surface tracking-tight flex items-center gap-2"
          >
            <span className="inline-block w-1.5 h-1.5 bg-primary rotate-45" />
            RATCHAWAT
          </Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant bg-surface-lowest px-2 py-0.5 rounded">
            Admin
          </span>
        </div>
        <AdminUserMenu email={email} />
      </header>

      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>

      <AdminBottomTabs />
    </div>
  );
}
