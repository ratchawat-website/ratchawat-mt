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
    afternoon: { start: "11:00", end: "17:00", duration: "1h slots" },
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
// Afternoon: 11:00 through 16:00 (before group class at 17:00).
export const PRIVATE_SLOT_TIMES = [
  "07:00",
  "08:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
] as const;

/**
 * Online private-session booking cutoffs.
 * Default slots: 2 hours notice. Early-morning slots (7:00, 8:00): 12 hours
 * notice, since trainers and admin commute before the session starts.
 */
export const PRIVATE_BOOKING_CUTOFF_HOURS_DEFAULT = 2;
export const PRIVATE_BOOKING_CUTOFF_HOURS_EARLY = 12;
export const EARLY_MORNING_SLOTS = ["07:00", "08:00"] as const;

export function getCutoffHoursForSlot(slot: string): number {
  return (EARLY_MORNING_SLOTS as readonly string[]).includes(slot)
    ? PRIVATE_BOOKING_CUTOFF_HOURS_EARLY
    : PRIVATE_BOOKING_CUTOFF_HOURS_DEFAULT;
}

export const PRIVATE_BOOKING_WHATSAPP_FALLBACK =
  "Slot too close for online booking? Send us a WhatsApp message and we will get back to you. Note: 7:00 and 8:00 sessions need 12 hours notice; later slots only need 2 hours.";

/**
 * Maximum simultaneous private sessions the camp can run per time slot,
 * per location. Each camp has several trainers, so a single private-slot
 * booking does not block the slot for everyone.
 */
export const PRIVATE_SLOT_CAPACITY = 6;

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
 * Returns true when the given slot (HH:mm) on `date` starts in less than the
 * cutoff that applies to that slot (12h for 7:00 and 8:00, 2h for the rest).
 * Below the cutoff the client must reach out on WhatsApp instead of booking
 * online.
 */
export function isSlotWithinCutoff(date: Date, slot: string): boolean {
  const [hh, mm] = slot.split(":").map(Number);
  const slotDate = new Date(date);
  slotDate.setHours(hh, mm, 0, 0);
  const cutoffMs = getCutoffHoursForSlot(slot) * 60 * 60 * 1000;
  return slotDate.getTime() - Date.now() < cutoffMs;
}
