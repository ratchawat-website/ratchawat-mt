/**
 * Single source of truth for training schedule.
 * Consumed by camps/*, programs/*, booking wizards, admin, and slots config.
 *
 * Open days: Monday to Saturday (6 days). Sunday closed for training.
 * (Sunday remains bookable for accommodation.)
 */

export const OPEN_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const OPEN_DAYS_LABEL = "Monday to Saturday";
export const DAYS_PER_WEEK = 6;

export const SCHEDULE = {
  group: {
    morning: { start: "9:00", end: "10:30", duration: "1h30" },
    evening: { start: "17:00", end: "18:30", duration: "1h30" },
    location: "both",
  },
  private: {
    morning: { start: "7:00", end: "9:00", duration: "1h slots" },
    afternoon: { start: "10:00", end: "17:00", duration: "1h slots" },
    location: "both",
  },
  fighter: {
    morning: { start: "7:30", end: "10:00", duration: "2h30" },
    afternoon: { start: "16:00", end: "18:30", duration: "2h30" },
    location: "plai-laem",
  },
} as const;

// Private session slots (hourly). Derived to stay aligned with SCHEDULE.private.
// Morning: 7:00, 8:00 (before group class at 9:00).
// Afternoon: 10:00 through 16:00 (before group class at 17:00).
export const PRIVATE_SLOT_TIMES = [
  "07:00",
  "08:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
] as const;

export const PRIVATE_BOOKING_CUTOFF_HOURS = 12;
export const PRIVATE_BOOKING_WHATSAPP_FALLBACK =
  "Less than 12 hours before the session? Send us a WhatsApp message and we will get back to you.";

export const CAMP_WHATSAPP_NUMBER = "66630802876";
export const CAMP_WHATSAPP_DISPLAY = "+66 63 080 2876";

/**
 * Build a WhatsApp `wa.me` URL with an optional pre-filled message.
 */
export function buildWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${CAMP_WHATSAPP_NUMBER}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/**
 * Returns true when the given slot (HH:mm) on `date` falls inside the
 * same-day 12-hour cutoff, i.e. the slot is today AND starts in less than
 * `PRIVATE_BOOKING_CUTOFF_HOURS` from now. For any future date the slot is
 * always bookable online. Below the cutoff the client must reach out on
 * WhatsApp instead.
 */
export function isSlotWithinCutoff(date: Date, slot: string): boolean {
  const now = new Date();
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (!isSameDay) return false;

  const [hh, mm] = slot.split(":").map(Number);
  const slotDate = new Date(date);
  slotDate.setHours(hh, mm, 0, 0);
  const cutoffMs = PRIVATE_BOOKING_CUTOFF_HOURS * 60 * 60 * 1000;
  return slotDate.getTime() - now.getTime() < cutoffMs;
}
