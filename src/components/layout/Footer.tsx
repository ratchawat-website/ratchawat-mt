import Image from "next/image";
import Link from "next/link";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5H16.5V4.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V10.5H7.5v3h2.6V21h3.4z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const linkClasses = "text-xs text-[#777] hover:text-primary transition-colors";

export default function Footer() {
  return (
    <footer className="bg-surface-low">
      {/* Top accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

      {/* Brand row */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-surface-lowest">
        <Link href="/" className="font-serif text-base font-semibold text-on-surface tracking-tight flex items-center gap-2" aria-label="Chor Ratchawat Muay Thai - Home">
          <Image
            src="/images/logo.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          RATCHAWAT MUAY THAI
        </Link>
        <div className="flex gap-3">
          <a
            href="https://facebook.com/Chor.RatchawatMuayThaiGym"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
            aria-label="Facebook"
          >
            <FacebookIcon className="w-4 h-4" />
          </a>
          <a
            href="https://instagram.com/chor.ratchawatmuaythai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
            aria-label="Instagram"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Columns */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
        {/* Training */}
        <div>
          <h4 className="text-[9px] font-semibold uppercase tracking-[0.19em] text-primary mb-4">Training</h4>
          <ul className="space-y-2.5">
            <li><Link href="/programs" className={linkClasses}>Programs</Link></li>
            <li><Link href="/programs/group-adults" className={linkClasses}>Group Classes</Link></li>
            <li><Link href="/programs/group-kids" className={linkClasses}>Kids Classes</Link></li>
            <li><Link href="/programs/private" className={linkClasses}>Private Lessons</Link></li>
            <li><Link href="/programs/fighter" className={linkClasses}>Fighter Program</Link></li>
            <li><Link href="/pricing" className={linkClasses}>Pricing</Link></li>
            <li><Link href="/booking" className={linkClasses}>Book Online</Link></li>
          </ul>
        </div>

        {/* Camps */}
        <div>
          <h4 className="text-[9px] font-semibold uppercase tracking-[0.19em] text-primary mb-4">Camps</h4>
          <ul className="space-y-2.5">
            <li><Link href="/camps/bo-phut" className={linkClasses}>Bo Phut</Link></li>
            <li><Link href="/camps/plai-laem" className={linkClasses}>Plai Laem</Link></li>
            <li><Link href="/team" className={linkClasses}>Our Trainers</Link></li>
            <li><Link href="/reviews" className={linkClasses}>Reviews</Link></li>
          </ul>
        </div>

        {/* Info */}
        <div>
          <h4 className="text-[9px] font-semibold uppercase tracking-[0.19em] text-primary mb-4">Info</h4>
          <ul className="space-y-2.5">
            <li><Link href="/about" className={linkClasses}>About</Link></li>
            <li><Link href="/accommodation" className={linkClasses}>Accommodation</Link></li>
            <li><Link href="/visa/dtv" className={linkClasses}>DTV Visa</Link></li>
            <li><Link href="/faq" className={linkClasses}>FAQ</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-[9px] font-semibold uppercase tracking-[0.19em] text-primary mb-4">Contact</h4>
          <ul className="space-y-2.5">
            <li><a href="tel:+66630802876" className={linkClasses}>+66 63 080 2876</a></li>
            <li><a href="mailto:chor.ratchawat@gmail.com" className={linkClasses}>chor.ratchawat@gmail.com</a></li>
            <li><a href="https://wa.me/66630802876" target="_blank" rel="noopener noreferrer" className={linkClasses}>WhatsApp</a></li>
            <li><Link href="/contact" className={linkClasses}>Contact Page</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 py-4 border-t border-surface-lowest flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-[10px] text-[#444]">&copy; {new Date().getFullYear()} Chor Ratchawat Muay Thai Gym. All rights reserved.</p>
        <div className="flex gap-4 text-[10px] text-[#444]">
          <Link href="/privacy" className="hover:text-on-surface-variant transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-on-surface-variant transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
