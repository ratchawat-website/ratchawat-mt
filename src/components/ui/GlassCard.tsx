import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  number?: string;
  showTopLine?: boolean;
  showLeftBorder?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  hover = true,
  number,
  showTopLine = true,
  showLeftBorder = true,
}: GlassCardProps) {
  return (
    <div
      className={`group/card relative rounded-card bg-surface-lowest overflow-hidden transition-all duration-300 ${
        hover
          ? "hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
          : ""
      } shadow-card ${
        showLeftBorder
          ? "border-l-2 border-l-[var(--border-accent)] hover:border-l-[var(--border-accent-hover)]"
          : ""
      } border-b-2 border-b-outline-variant ${
        hover ? "hover:border-b-primary" : ""
      } ${className}`}
    >
      {showTopLine && (
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff660040] to-transparent transition-all duration-300 ${
            hover ? "group-hover/card:via-primary" : ""
          }`}
        />
      )}

      <div className="relative p-6 sm:p-8">
        {number && (
          <span
            aria-hidden="true"
            className="absolute top-4 right-4 font-serif text-5xl font-bold leading-none text-primary opacity-[var(--filigree-opacity)] transition-opacity duration-300 group-hover/card:opacity-[var(--filigree-opacity-hover)] select-none"
          >
            {number}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
