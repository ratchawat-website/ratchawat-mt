import GlassCard from "./GlassCard";

interface ScheduleSlot {
  time: string;
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
}

interface ScheduleTableProps {
  schedule: ScheduleSlot[];
  className?: string;
}

const DAYS = [
  { key: "monday" as const, label: "Mon" },
  { key: "tuesday" as const, label: "Tue" },
  { key: "wednesday" as const, label: "Wed" },
  { key: "thursday" as const, label: "Thu" },
  { key: "friday" as const, label: "Fri" },
  { key: "saturday" as const, label: "Sat" },
];

function getCellStyle(value: string | undefined) {
  if (!value) return { bg: "", text: "text-outline" };
  const lower = value.toLowerCase();
  if (lower.includes("private"))
    return { bg: "bg-green-500/10", text: "text-green-500" };
  if (lower.includes("fighter"))
    return { bg: "bg-primary/15", text: "text-primary" };
  return { bg: "bg-primary/10", text: "text-on-surface" };
}

export default function ScheduleTable({ schedule, className = "" }: ScheduleTableProps) {
  return (
    <div className={className}>
      {/* Desktop table */}
      <div className="hidden md:block">
        <GlassCard hover={false}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-[9px] uppercase tracking-[0.125em] text-primary font-bold">
                    Time
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day.key}
                      className="px-3 py-3 text-center text-[9px] uppercase tracking-[0.125em] text-primary font-bold"
                    >
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.map((slot) => (
                  <tr key={slot.time} className="border-t border-outline-variant">
                    <td className="px-3 py-3 font-serif text-[13px] font-semibold text-on-surface whitespace-nowrap">
                      {slot.time}
                    </td>
                    {DAYS.map((day) => {
                      const value = slot[day.key];
                      const style = getCellStyle(value);
                      return (
                        <td key={day.key} className="px-3 py-3 text-center">
                          {value ? (
                            <span
                              className={`inline-block px-3 py-1.5 rounded text-xs font-medium ${style.bg} ${style.text}`}
                            >
                              {value}
                            </span>
                          ) : (
                            <span className="text-outline">&mdash;</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-outline-variant">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Group
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Private
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-primary/70" />
              Fighter
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Mobile list */}
      <div className="md:hidden space-y-6">
        {DAYS.map((day) => {
          const slots = schedule.filter((s) => s[day.key]);
          if (slots.length === 0) return null;

          return (
            <div key={day.key}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-primary text-xs uppercase tracking-[0.19em] font-bold">
                  {day.label}
                </h3>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>
              <div className="space-y-2">
                {slots.map((slot) => {
                  const value = slot[day.key]!;
                  const style = getCellStyle(value);
                  return (
                    <div
                      key={slot.time}
                      className="flex items-center gap-3 bg-surface-lowest rounded-[6px] p-3"
                    >
                      <span className="font-serif text-[15px] font-bold text-on-surface min-w-[60px]">
                        {slot.time}
                      </span>
                      <span className="text-on-surface-variant text-xs flex-1">
                        {value}
                      </span>
                      <span className={`badge-underline ${style.text}`}>
                        {value.toLowerCase().includes("private")
                          ? "Private"
                          : value.toLowerCase().includes("fighter")
                          ? "Fighter"
                          : "Group"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
