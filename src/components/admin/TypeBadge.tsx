const TYPE_STYLES: Record<string, string> = {
  training: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  private: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  "camp-stay": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  fighter: "bg-red-500/10 text-red-400 border-red-500/30",
};

const TYPE_LABELS: Record<string, string> = {
  training: "Training",
  private: "Private",
  "camp-stay": "Camp Stay",
  fighter: "Fighter",
};

export default function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-widest border ${
        TYPE_STYLES[type] ??
        "bg-surface-lowest text-on-surface-variant border-outline-variant"
      }`}
    >
      {TYPE_LABELS[type] ?? type}
    </span>
  );
}
