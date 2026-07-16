/**
 * Single source of truth for training schedule.
 * Consumed by camps/*, programs/*, booking wizards, admin, and slots config.
 *
 * Open days: Monday to Saturday (6 days). Sunday closed for training.
 * (Sunday remains bookable for accommodation.)
 */

import { bangkokSlotInstant } from "@/lib/utils/bangkok-time";

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
    morning: { start: "7:00", end: "10:00", duration: "1h slots" },
    afternoon: { start: "10:30", end: "17:00", duration: "1h slots" },
    evening: { start: "18:30", end: "20:00", duration: "1h slots" },
    location: "both",
  },
  fighter: {
    morning: { start: "7:30", end: "10:00", duration: "2h30" },
    afternoon: { start: "16:00", end: "18:30", duration: "2h30" },
    location: "plai-laem",
  },
} as const;

// Private session start times, client-approved 2026-07-10.
// 30-minute starts, sessions last 60 minutes: two consecutive starts overlap,
// which the client accepts (capacity is counted per start, not per overlap).
export const PRIVATE_SLOT_TIMES = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "18:30",
  "19:00",
] as const;

/**
 * Online private-session booking cutoffs.
 * Default slots: 2 hours notice. Early slots: 12 hours notice, since
 * trainers and admin commute before the session starts.
 */
export const PRIVATE_BOOKING_CUTOFF_HOURS_DEFAULT = 2;
export const PRIVATE_BOOKING_CUTOFF_HOURS_EARLY = 12;
/** Slots starting before 09:30 need 12h notice (trainers commute early). */
export const EARLY_CUTOFF_BEFORE = "09:30";

export function getCutoffHoursForSlot(slot: string): number {
  return slot < EARLY_CUTOFF_BEFORE
    ? PRIVATE_BOOKING_CUTOFF_HOURS_EARLY
    : PRIVATE_BOOKING_CUTOFF_HOURS_DEFAULT;
}

export const PRIVATE_BOOKING_WHATSAPP_FALLBACK =
  "Slot too close for online booking? Send us a WhatsApp message and we will get back to you. Note: sessions starting before 9:30 need 12 hours notice; later slots only need 2 hours.";

/** Display groups for the private-slot picker. Must cover every slot once. */
export const SLOT_GROUPS = [
  { label: "Morning", slots: ["07:00", "07:30", "08:00", "08:30", "09:00"] },
  { label: "Midday", slots: ["10:30", "11:00", "11:30", "12:00", "12:30"] },
  {
    label: "Afternoon",
    slots: ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"],
  },
  { label: "Evening", slots: ["18:30", "19:00"] },
] as const;

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
 * Returns true when the given slot (HH:mm) on `dateStr` (yyyy-MM-dd,
 * Bangkok calendar) starts in less than the cutoff that applies to that
 * slot (12h before 09:30, 2h for the rest). Slot instants are anchored to
 * Asia/Bangkok so the check gives the same answer on the UTC server and
 * in any visitor's browser. Below the cutoff the client must reach out on
 * WhatsApp instead of booking online.
 */
export function isSlotWithinCutoff(dateStr: string, slot: string): boolean {
  const slotInstant = bangkokSlotInstant(dateStr, slot);
  const cutoffMs = getCutoffHoursForSlot(slot) * 60 * 60 * 1000;
  return slotInstant - Date.now() < cutoffMs;
}
