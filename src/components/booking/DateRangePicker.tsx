"use client";

import { useState } from "react";
import { DayPicker, Matcher, DateRange } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { calendarClassNames } from "@/components/ui/calendar-tokens";

interface DateRangePickerProps {
  range: DateRange | undefined;
  /** clickedDay is the day that triggered the selection (react-day-picker triggerDate). */
  onSelect: (range: DateRange | undefined, clickedDay: Date) => void;
  minDate?: Date;
  disabledDays?: Matcher | Matcher[];
}

export default function DateRangePicker({
  range,
  onSelect,
  minDate,
  disabledDays,
}: DateRangePickerProps) {
  const [month, setMonth] = useState<Date>(range?.from ?? new Date());

  const disabled: Matcher[] = [];

  if (minDate) disabled.push({ before: minDate });
  if (disabledDays) {
    if (Array.isArray(disabledDays)) disabled.push(...disabledDays);
    else disabled.push(disabledDays);
  }

  return (
    <div className="bg-surface-lowest rounded-lg p-5">
      {/* Custom month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setMonth((m) => subMonths(m, 1))}
          className="p-2 rounded-lg border-2 border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="font-serif font-bold text-on-surface text-lg uppercase tracking-wide">
          {format(month, "MMMM yyyy")}
        </span>

        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="p-2 rounded-lg border-2 border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="flex justify-center">
        <DayPicker
          mode="range"
          month={month}
          onMonthChange={setMonth}
          selected={range}
          onSelect={onSelect}
          disabled={disabled}
          showOutsideDays
          hideNavigation
          classNames={{
            ...calendarClassNames,
            range_start:
              "!bg-primary !text-on-primary font-bold rounded-md ring-0 hover:!ring-0",
            range_middle:
              "!bg-primary/15 !text-on-surface rounded-none ring-0 hover:!ring-0",
            range_end:
              "!bg-primary !text-on-primary font-bold rounded-md ring-0 hover:!ring-0",
          }}
        />
      </div>
    </div>
  );
}
