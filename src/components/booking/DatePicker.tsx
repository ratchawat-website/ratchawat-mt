"use client";

import { useState } from "react";
import { DayPicker, Matcher } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { calendarClassNames } from "@/components/ui/calendar-tokens";

interface DatePickerProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDays?: Matcher | Matcher[];
  weekdaysDisabled?: number[];
}

export default function DatePicker({
  selected,
  onSelect,
  minDate,
  maxDate,
  disabledDays,
  weekdaysDisabled,
}: DatePickerProps) {
  const [month, setMonth] = useState<Date>(selected ?? new Date());

  const disabled: Matcher[] = [];

  if (minDate) disabled.push({ before: minDate });
  if (maxDate) disabled.push({ after: maxDate });
  if (weekdaysDisabled && weekdaysDisabled.length > 0) {
    disabled.push({ dayOfWeek: weekdaysDisabled });
  }
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
          mode="single"
          month={month}
          onMonthChange={setMonth}
          selected={selected}
          onSelect={onSelect}
          disabled={disabled}
          showOutsideDays
          hideNavigation
          classNames={calendarClassNames}
        />
      </div>
    </div>
  );
}
