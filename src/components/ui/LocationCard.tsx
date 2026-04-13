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
  campPageHref?: string;
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
      </div>

      {/* Info section */}
      <div className="p-5">
        <h3 className="font-serif text-xl font-bold text-on-surface uppercase mb-4">
          {name}
        </h3>

        <ul className={`space-y-3 text-xs text-on-surface-variant ${campPageHref ? "mb-6" : ""}`}>
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

        {/* Bottom link — only shown when linking to another page */}
        {campPageHref && (
          <div className="border-t border-outline-variant pt-4">
            <Link href={campPageHref} className="btn-link">
              View camp details <span className="btn-arrow">&rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
