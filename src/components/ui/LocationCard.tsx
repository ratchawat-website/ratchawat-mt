import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Link from "next/link";
import GlassCard from "./GlassCard";

interface LocationCardProps {
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapEmbedUrl: string;
  campPageHref: string;
  isOpen?: boolean;
  className?: string;
}

export default function LocationCard({
  name,
  address,
  phone,
  email,
  hours,
  mapEmbedUrl,
  campPageHref,
  isOpen = true,
  className = "",
}: LocationCardProps) {
  return (
    <GlassCard className={`!p-0 overflow-hidden ${className}`}>
      {/* Map zone */}
      <div className="relative aspect-video">
        <iframe
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${name}`}
        />
        {/* Open Now badge */}
        {isOpen && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded text-xs uppercase tracking-wider font-semibold text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Open Now
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="p-5">
        <h3 className="font-serif text-xl font-bold text-on-surface uppercase mb-4">
          {name}
        </h3>

        <ul className="space-y-3 text-xs text-on-surface-variant mb-6">
          <li className="flex items-start gap-3">
            <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
            <span>{address}</span>
          </li>
          <li className="flex items-center gap-3">
            <Phone size={16} className="text-primary shrink-0" />
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-primary transition-colors">
              {phone}
            </a>
          </li>
          <li className="flex items-center gap-3">
            <Mail size={16} className="text-primary shrink-0" />
            <a href={`mailto:${email}`} className="hover:text-primary transition-colors">
              {email}
            </a>
          </li>
          <li className="flex items-center gap-3">
            <Clock size={16} className="text-primary shrink-0" />
            <span>{hours}</span>
          </li>
        </ul>

        {/* Bottom link */}
        <div className="border-t border-outline-variant pt-4">
          <Link href={campPageHref} className="btn-link">
            View camp details <span className="btn-arrow">&rarr;</span>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}
