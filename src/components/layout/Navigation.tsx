"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Programs", href: "/programs" },
  { label: "Bo Phut", href: "/camps/bo-phut" },
  { label: "Plai Laem", href: "/camps/plai-laem" },
  { label: "Pricing", href: "/pricing" },
  { label: "Visa", href: "/visa/dtv" },
  { label: "Contact", href: "/contact" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-white/5">
      <nav className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between h-16">
        <Link href="/" className="font-serif text-lg font-bold text-on-surface tracking-tight">Ratchawat</Link>
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="text-xs font-sans font-medium uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors">{item.label}</Link>
          ))}
          <Link href="/booking" className="bg-primary text-on-primary text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-[0.5rem] hover:bg-primary-dim transition-colors">Book Now</Link>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-on-surface" aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      {isOpen && (
        <div className="md:hidden bg-surface border-t border-white/5 px-6 py-4 space-y-3">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="block text-sm text-on-surface-variant hover:text-primary py-2">{item.label}</Link>
          ))}
          <Link href="/booking" onClick={() => setIsOpen(false)} className="block bg-primary text-on-primary text-sm font-semibold text-center px-5 py-3 rounded-[0.5rem] mt-4">Book Now</Link>
        </div>
      )}
    </header>
  );
}
