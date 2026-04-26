"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import AdminNavButton from "@/components/admin/AdminNavButton";

const navItems = [
  {
    label: "Camps",
    href: "#",
    children: [
      { label: "Bo Phut", href: "/camps/bo-phut" },
      { label: "Plai Laem", href: "/camps/plai-laem" },
    ],
  },
  { label: "Programs", href: "/programs" },
  { label: "Accommodation", href: "/accommodation" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Visa", href: "/visa/dtv" },
  { label: "Contact", href: "/contact" },
];

interface NavigationProps {
  isAdmin?: boolean;
}

export default function Navigation({ isAdmin = false }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-3">
      <nav
        className={`relative w-full max-w-6xl rounded-2xl border transition-all duration-300 ${
          scrolled
            ? "border-white/10 bg-surface-lowest/70 backdrop-blur-xl shadow-lg shadow-black/20"
            : "border-white/5 bg-surface-lowest/50 backdrop-blur-lg"
        }`}
      >
        {/* Top gradient line */}
        <div className="absolute top-0 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-[#ff660030] to-transparent" />

        <div className="flex items-center justify-between px-5 sm:px-6 h-14">
          <Link
            href="/"
            className="font-serif text-base font-semibold text-on-surface tracking-tight flex items-center gap-2"
            aria-label="Chor Ratchawat Muay Thai - Home"
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
            RATCHAWAT
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label} className="relative group">
                  <button
                    className="flex items-center gap-1 text-[11px] font-sans font-medium uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    {item.label}
                    <ChevronDown
                      size={12}
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                    />
                  </button>
                  {/* Dropdown */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200">
                    <div className="bg-surface-lowest border border-white/10 rounded-lg shadow-lg shadow-black/30 py-2 min-w-[160px]">
                      {/* Top accent */}
                      <div className="absolute top-3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ff660030] to-transparent rounded-t-lg" />
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-[11px] font-sans font-medium uppercase tracking-widest text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[11px] font-sans font-medium uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              )
            )}
            <Link
              href="/booking"
              className="bg-primary text-on-primary text-[11px] font-semibold uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-primary-dim transition-colors"
            >
              Book Now
            </Link>
            <AdminNavButton isAdmin={isAdmin} />
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-on-surface"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div id="mobile-menu" className="md:hidden border-t border-white/5 px-5 py-4 space-y-1">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant pt-2 pb-1">
                    {item.label}
                  </span>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setIsOpen(false)}
                      className="block text-sm text-on-surface-variant hover:text-primary py-1.5 pl-3"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-sm text-on-surface-variant hover:text-primary py-2"
                >
                  {item.label}
                </Link>
              )
            )}
            <Link
              href="/booking"
              onClick={() => setIsOpen(false)}
              className="block bg-primary text-on-primary text-sm font-semibold text-center px-5 py-2.5 rounded-lg mt-3"
            >
              Book Now
            </Link>
            <div className="border-t border-white/5 pt-3 mt-2 flex justify-center">
              <AdminNavButton isAdmin={isAdmin} />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
