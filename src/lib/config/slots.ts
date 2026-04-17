import { PRIVATE_SLOT_TIMES } from "@/content/schedule";

export const PRIVATE_SLOTS = PRIVATE_SLOT_TIMES;
export type PrivateSlot = (typeof PRIVATE_SLOTS)[number];
