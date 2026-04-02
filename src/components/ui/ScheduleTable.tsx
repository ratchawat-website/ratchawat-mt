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

export default function ScheduleTable({
  schedule,
  className = "",
}: ScheduleTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-sm sm:text-base">
        <thead>
          <tr>
            <th className="border-2 border-outline-variant bg-surface-lowest px-3 py-3 text-left text-primary font-bold uppercase tracking-wider text-xs sm:text-sm">
              Time
            </th>
            {DAYS.map((day) => (
              <th
                key={day.key}
                className="border-2 border-outline-variant bg-surface-lowest px-3 py-3 text-center text-primary font-bold uppercase tracking-wider text-xs sm:text-sm"
              >
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedule.map((slot) => (
            <tr key={slot.time}>
              <td className="border-2 border-outline-variant bg-surface-lowest px-3 py-3 font-semibold text-on-surface whitespace-nowrap">
                {slot.time}
              </td>
              {DAYS.map((day) => {
                const value = slot[day.key];
                return (
                  <td
                    key={day.key}
                    className={`border-2 border-outline-variant px-3 py-3 text-center ${
                      value
                        ? "bg-primary/10 text-on-surface font-medium"
                        : "bg-surface text-on-surface-variant"
                    }`}
                  >
                    {value || "\u2014"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
