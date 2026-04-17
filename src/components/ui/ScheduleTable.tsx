import GlassCard from "./GlassCard";

interface ScheduleSlot {
  time: string;
  duration: string;
  type: "group" | "private" | "fighter";
  label: string;
}

interface ScheduleTableProps {
  schedule: ScheduleSlot[];
  className?: string;
}

const TYPE_STYLES = {
  group: {
    bg: "bg-primary/10 border-primary/20",
    dot: "bg-primary",
    text: "text-primary",
    label: "Group Class",
  },
  private: {
    bg: "bg-green-500/10 border-green-500/20",
    dot: "bg-green-500",
    text: "text-green-500",
    label: "Private",
  },
  fighter: {
    bg: "bg-red-500/10 border-red-500/20",
    dot: "bg-red-500",
    text: "text-red-500",
    label: "Fighter",
  },
};

export default function ScheduleTable({
  schedule,
  className = "",
}: ScheduleTableProps) {
  const hasFighter = schedule.some((s) => s.type === "fighter");
  return (
    <div className={className}>
      <GlassCard hover={false}>
        {/* Days badge */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Monday - Saturday
          </span>
          <div className="flex-1 h-px bg-outline-variant" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">
            Sunday Closed
          </span>
        </div>

        {/* Schedule slots */}
        <div className="space-y-3">
          {schedule.map((slot) => {
            const style = TYPE_STYLES[slot.type];
            return (
              <div
                key={slot.time}
                className={`flex items-center gap-4 rounded-lg border-2 ${style.bg} p-4`}
              >
                {/* Time block */}
                <div className="shrink-0 min-w-[100px] sm:min-w-[120px]">
                  <span className="font-serif text-lg sm:text-xl font-bold text-on-surface">
                    {slot.time}
                  </span>
                </div>

                {/* Divider */}
                <div className="w-px h-10 bg-outline-variant shrink-0 hidden sm:block" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    <span
                      className={`text-sm font-semibold ${style.text}`}
                    >
                      {slot.label}
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-variant">
                    {slot.duration}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-outline-variant">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Group Class
          </div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Private Lesson
          </div>
          {hasFighter && (
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Fighter Program
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Sunday Closed
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
