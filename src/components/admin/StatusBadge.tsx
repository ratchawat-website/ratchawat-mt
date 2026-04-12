const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  completed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-widest border ${
        STATUS_STYLES[status] ??
        "bg-surface-lowest text-on-surface-variant border-outline-variant"
      }`}
    >
      {status}
    </span>
  );
}
