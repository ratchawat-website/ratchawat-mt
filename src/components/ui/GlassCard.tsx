import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({ children, className = "", hover = true }: GlassCardProps) {
  return (
    <div className={`rounded-card p-6 sm:p-8 bg-surface-lowest ${hover ? "transition-shadow duration-300 hover:shadow-card-hover" : ""} shadow-card ${className}`}>
      {children}
    </div>
  );
}
