"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Programs", href: "/programs" },
  { label: "Camps", href: "/camps/bo-phut", children: [
    { label: "Bo Phut", href: "/camps/bo-phut" },
    { label: "Plai Laem", href: "/camps/plai-laem" },
  ]},
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Visa", href: "/visa/dtv" },
  { label: "Contact", href: "/contact" },
];

export default function Navigation() {
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
        className={`w-full max-w-6xl rounded-2xl border transition-all duration-300 ${
          scrolled
            ? "border-white/10 bg-surface-lowest/70 backdrop-blur-xl shadow-lg shadow-black/20"
            : "border-white/5 bg-surface-lowest/50 backdrop-blur-lg"
        }`}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 h-14">
          <Link
            href="/"
            className="font-serif text-base font-semibold text-on-surface tracking-tight"
          >
            Ratchawat
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[11px] font-sans font-medium uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/booking"
              className="bg-primary text-on-primary text-[11px] font-semibold uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-primary-dim transition-colors"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-on-surface"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-white/5 px-5 py-4 space-y-1">
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
          </div>
        )}
      </nav>
    </header>
  );
}
