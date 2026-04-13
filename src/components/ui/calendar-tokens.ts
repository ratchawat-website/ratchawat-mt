import type { ClassNames } from "react-day-picker";

export const calendarClassNames: Partial<ClassNames> = {
  root: "flex flex-col items-center",
  months: "flex flex-col",
  month: "space-y-4",
  month_caption: "hidden",
  caption_label: "hidden",
  nav: "hidden",
  button_previous: "hidden",
  button_next: "hidden",
  weekdays: "flex",
  weekday: "text-on-surface-variant text-[10px] font-semibold uppercase tracking-widest w-11 h-8 flex items-center justify-center",
  week: "flex mt-1",
  day: "relative w-11 h-11 flex items-center justify-center",
  day_button: "w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium text-on-surface hover:ring-2 hover:ring-primary transition-colors duration-150 cursor-pointer",
  selected: "!bg-primary !text-on-primary font-bold rounded-md ring-0 hover:!ring-0",
  today: "ring-1 ring-primary rounded-md",
  disabled: "!text-on-surface-variant/30 !bg-surface-low/50 line-through pointer-events-none hover:ring-0 rounded-md opacity-40",
  outside: "!text-on-surface-variant/20",
  hidden: "invisible",
};
