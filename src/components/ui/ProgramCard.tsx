import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import GlassCard from "./GlassCard";

interface ProgramCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  level: string;
  duration: string;
  number?: string;
  className?: string;
}

export default function ProgramCard({
  title,
  description,
  href,
  icon: Icon,
  level,
  duration,
  number,
  className = "",
}: ProgramCardProps) {
  return (
    <GlassCard number={number} className={`flex flex-col ${className}`}>
      <Icon size={28} className="text-primary mb-4" strokeWidth={2} />
      <h3 className="font-serif text-xl font-bold text-on-surface uppercase mb-2">
        {title}
      </h3>
      <div className="flex gap-3 mb-3">
        <span className="badge-underline badge-orange">{level}</span>
        <span className="badge-underline badge-neutral">{duration}</span>
      </div>
      <p className="text-on-surface-variant text-xs leading-relaxed mb-4 flex-1">
        {description}
      </p>
      <div className="border-t border-outline-variant pt-4 mt-auto">
        <Link href={href} className="btn-link">
          Learn more <span className="btn-arrow">&rarr;</span>
        </Link>
      </div>
    </GlassCard>
  );
}
