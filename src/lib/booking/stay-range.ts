import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  subDays,
} from "date-fns";
import type { DateRange } from "react-day-picker";

export interface StayRangeResult {
  range: DateRange | undefined;
  error: string | null;
}

/**
 * Validates a candidate stay range against the pool's full nights and the
 * minimum stay. On a sold-out conflict the selection restarts at the day the
 * user just clicked: react-day-picker extends ranges from the previous
 * anchor, so keeping a stale anchor would make every later click re-span the
 * same full night and fail forever.
 */
export function resolveStayRange(
  next: DateRange | undefined,
  clickedDay: Date,
  fullNights: Set<string>,
  minNights: number,
  current?: DateRange,
): StayRangeResult {
  // A click while a complete range is already selected starts a NEW
  // selection at the clicked day. react-day-picker's default only moves the
  // checkout date, which makes changing the check-in impossible.
  if (current?.from && current?.to) {
    return { range: { from: clickedDay, to: undefined }, error: null };
  }

  if (!next?.from || !next?.to) {
    return { range: next, error: null };
  }

  const nights = differenceInCalendarDays(next.to, next.from);
  if (nights < minNights) {
    return {
      range: { from: next.from, to: undefined },
      error: `Minimum stay is ${minNights} nights.`,
    };
  }

  // Every night of the stay must have a free unit (checkout night excluded).
  const nightsList = eachDayOfInterval({
    start: next.from,
    end: subDays(next.to, 1),
  });
  const conflict = nightsList.find((n) =>
    fullNights.has(format(n, "yyyy-MM-dd")),
  );
  if (conflict) {
    return {
      range: { from: clickedDay, to: undefined },
      error: `Sold out on ${format(conflict, "MMM d, yyyy")}. Pick different dates.`,
    };
  }

  return { range: next, error: null };
}
