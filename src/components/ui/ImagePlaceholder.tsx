interface ImagePlaceholderProps {
  category?: "default" | "training" | "gym" | "nature" | "team" | "accommodation";
  className?: string;
  aspectRatio?: string;
}

const gradients: Record<string, string> = {
  default: "from-primary/20 via-surface-low to-primary-deep/20",
  training: "from-orange-900/40 via-red-900/20 to-amber-900/30",
  gym: "from-zinc-800 via-neutral-900 to-zinc-800",
  nature: "from-emerald-900/30 via-teal-900/20 to-cyan-900/30",
  team: "from-slate-800 via-gray-900 to-zinc-800",
  accommodation: "from-amber-900/30 via-orange-900/20 to-yellow-900/30",
};

export default function ImagePlaceholder({ category = "default", className = "", aspectRatio = "aspect-video" }: ImagePlaceholderProps) {
  return (
    <div className={`bg-gradient-to-br ${gradients[category]} ${aspectRatio} rounded-card ${className}`} role="img" aria-label="Image placeholder" />
  );
}
