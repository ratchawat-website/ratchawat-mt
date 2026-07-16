/**
 * Bangkok wall-clock helpers. The camp operates in Asia/Bangkok (UTC+7,
 * no DST), while Vercel functions run in UTC and visitor browsers can be
 * in any timezone. Every "is it too late to book" decision must go
 * through these helpers instead of local Date methods.
 */

const BANGKOK_UTC_OFFSET = "+07:00";

/** UTC instant (epoch ms) of `HH:mm` on `yyyy-MM-dd`, Bangkok wall-clock. */
export function bangkokSlotInstant(dateStr: string, slot: string): number {
  return Date.parse(`${dateStr}T${slot}:00${BANGKOK_UTC_OFFSET}`);
}

/** Current calendar date in Bangkok, formatted yyyy-MM-dd. */
export function todayInBangkok(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
