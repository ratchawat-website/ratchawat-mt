export const PRIVATE_SLOTS = [
  "08:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
] as const;

export type PrivateSlot = (typeof PRIVATE_SLOTS)[number];
