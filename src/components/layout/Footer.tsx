import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-low py-16 px-6 sm:px-10 md:px-16 lg:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <h3 className="font-serif text-lg font-bold text-on-surface mb-4">Ratchawat</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">Muay Thai training camp in Koh Samui. Two locations in Bo Phut and Plai Laem. All levels welcome.</p>
        </div>
        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-on-surface mb-4">Training</h4>
          <ul className="space-y-2">
            <li><Link href="/programs" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Programs</Link></li>
            <li><Link href="/pricing" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Pricing</Link></li>
            <li><Link href="/booking" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Book Online</Link></li>
            <li><Link href="/team" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Our Trainers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-on-surface mb-4">Info</h4>
          <ul className="space-y-2">
            <li><Link href="/camps/bo-phut" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Bo Phut Camp</Link></li>
            <li><Link href="/camps/plai-laem" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Plai Laem Camp</Link></li>
            <li><Link href="/accommodation" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Accommodation</Link></li>
            <li><Link href="/visa/dtv" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Visa Support</Link></li>
            <li><Link href="/faq" className="text-sm text-on-surface-variant hover:text-primary transition-colors">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-on-surface mb-4">Contact</h4>
          <ul className="space-y-2">
            <li className="text-sm text-on-surface-variant">+66 63 080 2876</li>
            <li><a href="mailto:chor.ratchawat@gmail.com" className="text-sm text-on-surface-variant hover:text-primary transition-colors">chor.ratchawat@gmail.com</a></li>
            <li className="flex gap-4 mt-4">
              <a href="https://facebook.com/Chor.RatchawatMuayThaiGym" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors" aria-label="Facebook">FB</a>
              <a href="https://instagram.com/chor.ratchawatmuaythai" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors" aria-label="Instagram">IG</a>
              <a href="https://tiktok.com/@chor.ratchawat" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors" aria-label="TikTok">TT</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center">
        <p className="text-xs text-on-surface-variant">&copy; {new Date().getFullYear()} Chor Ratchawat Muay Thai Gym. All rights reserved.</p>
      </div>
    </footer>
  );
}
