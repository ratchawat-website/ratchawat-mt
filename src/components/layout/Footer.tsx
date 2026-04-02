import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-low py-16 px-6 sm:px-10 md:px-16 lg:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <h3 className="font-serif text-base font-semibold text-on-surface mb-3">Ratchawat</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">
            Muay Thai training camp in Koh Samui. Two locations in Bo Phut and Plai Laem. All levels welcome.
          </p>
        </div>

        {/* Training */}
        <div>
          <h4 className="font-sans text-[10px] font-semibold uppercase tracking-widest text-on-surface mb-3">Training</h4>
          <ul className="space-y-2">
            <li><Link href="/programs" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Programs</Link></li>
            <li><Link href="/programs/group-adults" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Group Classes</Link></li>
            <li><Link href="/programs/group-kids" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Kids Classes</Link></li>
            <li><Link href="/programs/private" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Private Lessons</Link></li>
            <li><Link href="/programs/fighter" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Fighter Program</Link></li>
            <li><Link href="/pricing" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Pricing</Link></li>
            <li><Link href="/booking" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Book Online</Link></li>
          </ul>
        </div>

        {/* Camps */}
        <div>
          <h4 className="font-sans text-[10px] font-semibold uppercase tracking-widest text-on-surface mb-3">Camps</h4>
          <ul className="space-y-2">
            <li><Link href="/camps/bo-phut" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Bo Phut</Link></li>
            <li><Link href="/camps/plai-laem" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Plai Laem</Link></li>
            <li><Link href="/team" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Our Trainers</Link></li>
            <li><Link href="/gallery" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Gallery</Link></li>
            <li><Link href="/reviews" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Reviews</Link></li>
          </ul>
        </div>

        {/* Info */}
        <div>
          <h4 className="font-sans text-[10px] font-semibold uppercase tracking-widest text-on-surface mb-3">Info</h4>
          <ul className="space-y-2">
            <li><Link href="/about" className="text-sm text-on-surface-variant hover:text-primary transition-colors">About</Link></li>
            <li><Link href="/accommodation" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Accommodation</Link></li>
            <li><Link href="/services" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Services</Link></li>
            <li><Link href="/visa/dtv" className="text-sm text-on-surface-variant hover:text-primary transition-colors">DTV Visa</Link></li>
            <li><Link href="/visa/90-days" className="text-sm text-on-surface-variant hover:text-primary transition-colors">90-Day Visa</Link></li>
            <li><Link href="/faq" className="text-sm text-on-surface-variant hover:text-primary transition-colors">FAQ</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-sans text-[10px] font-semibold uppercase tracking-widest text-on-surface mb-3">Contact</h4>
          <ul className="space-y-2">
            <li><a href="tel:+66630802876" className="text-sm text-on-surface-variant hover:text-primary transition-colors">+66 63 080 2876</a></li>
            <li><a href="mailto:chor.ratchawat@gmail.com" className="text-sm text-on-surface-variant hover:text-primary transition-colors">chor.ratchawat@gmail.com</a></li>
            <li><a href="https://wa.me/66630802876" target="_blank" rel="noopener noreferrer" className="text-sm text-on-surface-variant hover:text-primary transition-colors">WhatsApp</a></li>
            <li><Link href="/contact" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Contact Page</Link></li>
          </ul>
          <div className="flex gap-4 mt-4">
            <a href="https://facebook.com/Chor.RatchawatMuayThaiGym" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors text-xs font-medium" aria-label="Facebook">FB</a>
            <a href="https://instagram.com/chor.ratchawatmuaythai" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors text-xs font-medium" aria-label="Instagram">IG</a>
            <a href="https://tiktok.com/@chor.ratchawat" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors text-xs font-medium" aria-label="TikTok">TT</a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center">
        <p className="text-xs text-on-surface-variant">&copy; {new Date().getFullYear()} Chor Ratchawat Muay Thai Gym. All rights reserved.</p>
      </div>
    </footer>
  );
}
