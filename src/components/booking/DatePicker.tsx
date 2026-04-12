"use client";

import { DayPicker, Matcher } from "react-day-picker";
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
    <div className="bg-surface-lowest rounded-lg p-5 flex justify-center">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        showOutsideDays
        classNames={calendarClassNames}
      />
    </div>
  );
}
