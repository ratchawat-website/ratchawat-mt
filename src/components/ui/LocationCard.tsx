import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
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
    <GlassCard className={className} hover={false}>
      <div className="aspect-video rounded-[var(--radius-card)] overflow-hidden mb-6">
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

      <h3 className="font-serif text-xl font-bold text-on-surface uppercase mb-4">
        {name}
      </h3>

      <ul className="space-y-3 text-sm text-on-surface-variant mb-6">
        <li className="flex items-start gap-3">
          <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
          <span>{address}</span>
        </li>
        <li className="flex items-center gap-3">
          <Phone size={16} className="text-primary shrink-0" />
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="hover:text-primary transition-colors"
          >
            {phone}
          </a>
        </li>
        <li className="flex items-center gap-3">
          <Mail size={16} className="text-primary shrink-0" />
          <a
            href={`mailto:${email}`}
            className="hover:text-primary transition-colors"
          >
            {email}
          </a>
        </li>
        <li className="flex items-center gap-3">
          <Clock size={16} className="text-primary shrink-0" />
          <span>{hours}</span>
        </li>
      </ul>

      <Link
        href={campPageHref}
        className="inline-flex items-center gap-2 text-primary text-sm font-semibold hover:text-primary-dim transition-colors"
      >
        View camp details{" "}
        <ArrowRight size={16} className="transition-transform hover:translate-x-1" />
      </Link>
    </GlassCard>
  );
}
