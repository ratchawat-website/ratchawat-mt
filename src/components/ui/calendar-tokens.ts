import type { ClassNames } from "react-day-picker";

export const calendarClassNames: Partial<ClassNames> = {
  root: "w-full",
  months: "flex flex-col",
  month: "space-y-4",
  month_caption: "flex justify-center relative items-center h-10",
  caption_label: "font-serif font-bold text-on-surface text-lg uppercase tracking-wide",
  nav: "flex items-center gap-1",
  button_previous: "absolute left-0 inline-flex items-center justify-center w-9 h-9 rounded-md text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors",
  button_next: "absolute right-0 inline-flex items-center justify-center w-9 h-9 rounded-md text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors",
  weekdays: "flex",
  weekday: "text-on-surface-variant text-[10px] font-semibold uppercase tracking-widest w-11 h-8 flex items-center justify-center",
  week: "flex mt-1",
  day: "relative w-11 h-11 flex items-center justify-center",
  day_button: "w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium text-on-surface hover:ring-2 hover:ring-primary transition-colors duration-150 cursor-pointer",
  selected: "!bg-primary !text-on-primary font-bold rounded-md ring-0 hover:!ring-0",
  today: "ring-1 ring-primary rounded-md",
  disabled: "!text-on-surface-variant/30 line-through pointer-events-none hover:ring-0",
  outside: "!text-on-surface-variant/20",
  hidden: "invisible",
};
