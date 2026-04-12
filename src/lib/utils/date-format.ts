import { format, parseISO } from "date-fns";

/**
 * Short format: "Apr 12, 2026"
 * Use in: tables, cards, lists, confirmation page
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

/**
 * Long format: "Saturday, April 12, 2026"
 * Use in: wizard review steps, booking detail page
 */
export function formatDateLong(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "EEEE, MMMM d, yyyy");
}

/**
 * ISO format: "2026-04-12"
 * Use in: API calls, DB queries, form values
 */
export function formatDateISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
