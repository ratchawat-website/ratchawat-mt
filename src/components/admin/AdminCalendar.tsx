"use client";

import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  isSameMonth,
  isToday,
} from "date-fns";
import { Lock } from "lucide-react";
import { INVENTORY } from "@/lib/admin/inventory";

export interface DayData {
  rooms: number;
  bungalows: number;
  hasBlock: boolean;
}

interface Props {
  month: Date;
  dayDataMap: Record<string, DayData>;
  onDayClick: (date: Date) => void;
  selectedDate: Date | null;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function roomColor(count: number): string {
  if (count >= INVENTORY.rooms) return "text-red-400";
  if (count / INVENTORY.rooms >= 0.75) return "text-amber-400";
  return "text-green-400";
}

function bungalowColor(count: number): string {
  if (count >= INVENTORY.bungalows) return "text-red-400";
  return "text-green-400";
}

export default function AdminCalendar({
  month,
  dayDataMap,
  onDayClick,
  selectedDate,
}: Props) {
  const firstDay = startOfMonth(month);
  const lastDay = endOfMonth(month);
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });

  // Leading empty cells for the first week
  const leadingBlanks = getDay(firstDay);

  const selectedKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;

  return (
    <div className="w-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wider py-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading blanks */}
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const data = dayDataMap[key];
          const isSelected = key === selectedKey;
          const todayDay = isToday(day);
          const inMonth = isSameMonth(day, month);

          return (
            <button
              key={key}
              onClick={() => onDayClick(day)}
              className={[
                "flex flex-col items-start justify-start p-1.5 rounded-lg border-2 transition-colors text-left min-h-[4.5rem]",
                isSelected
                  ? "border-primary bg-primary/10"
                  : todayDay
                    ? "border-primary/40 bg-surface-lowest"
                    : "border-outline-variant bg-surface-lowest hover:border-primary/50 hover:bg-surface-lower",
                !inMonth && "opacity-40",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Day number */}
              <span
                className={[
                  "text-sm font-bold leading-none mb-1",
                  todayDay
                    ? "text-primary"
                    : isSelected
                      ? "text-primary"
                      : "text-on-surface",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {format(day, "d")}
              </span>

              {data ? (
                <div className="flex flex-col gap-0.5 w-full">
                  <span
                    className={`text-[10px] font-semibold leading-none ${roomColor(data.rooms)}`}
                  >
                    R {data.rooms}/{INVENTORY.rooms}
                  </span>
                  <span
                    className={`text-[10px] font-semibold leading-none ${bungalowColor(data.bungalows)}`}
                  >
                    B {data.bungalows}/{INVENTORY.bungalows}
                  </span>
                  {data.hasBlock && (
                    <Lock
                      size={10}
                      className="text-amber-400 mt-0.5"
                      aria-label="Manual block"
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-0.5 w-full">
                  <span className="text-[10px] font-semibold leading-none text-green-400">
                    R 0/{INVENTORY.rooms}
                  </span>
                  <span className="text-[10px] font-semibold leading-none text-green-400">
                    B 0/{INVENTORY.bungalows}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
