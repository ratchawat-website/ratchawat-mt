import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import GlassCard from "./GlassCard";

interface ProgramCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  level: string;
  duration: string;
  className?: string;
}

export default function ProgramCard({
  title,
  description,
  href,
  icon: Icon,
  level,
  duration,
  className = "",
}: ProgramCardProps) {
  return (
    <GlassCard className={className}>
      <Icon size={32} className="text-primary mb-4" />
      <h3 className="font-serif text-xl font-bold text-on-surface uppercase mb-2">
        {title}
      </h3>
      <div className="flex gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
          {level}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant bg-surface-lowest px-2 py-1 rounded">
          {duration}
        </span>
      </div>
      <p className="text-on-surface-variant text-sm leading-relaxed mb-4">
        {description}
      </p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-primary text-sm font-semibold hover:text-primary-dim transition-colors"
      >
        Learn more{" "}
        <ArrowRight
          size={16}
          className="transition-transform hover:translate-x-1"
        />
      </Link>
    </GlassCard>
  );
}
