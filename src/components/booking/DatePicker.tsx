"use client";

import { DayPicker, Matcher } from "react-day-picker";
import "react-day-picker/dist/style.css";

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
    <div className="rdp-wrapper bg-surface-lowest border-2 border-outline-variant rounded-[var(--radius-card)] p-4">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        showOutsideDays
        classNames={{
          root: "text-on-surface",
          caption_label: "font-serif font-bold text-on-surface",
          nav_button: "text-on-surface hover:text-primary",
          head_cell: "text-on-surface-variant text-xs font-semibold uppercase",
          day: "text-on-surface hover:bg-primary/10 rounded-md transition-colors",
          day_selected:
            "bg-primary text-white hover:bg-primary-dim font-bold",
          day_today: "text-primary font-bold",
          day_disabled: "text-on-surface-variant/30 line-through",
          day_outside: "text-on-surface-variant/40",
        }}
      />
    </div>
  );
}
