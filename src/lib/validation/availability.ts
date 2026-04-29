import { z } from "zod";
import { PRIVATE_SLOTS } from "@/lib/config/slots";

// Mirrors the CHECK constraint on availability_blocks.type
// (see migrations 20260413000002 + 20260429000000).
export const AvailabilityBlockTypeSchema = z.enum([
  "private",
  "private-slot",
  "private-slot-closure",
  "full",
]);

export const AvailabilityBlockInsertSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  type: AvailabilityBlockTypeSchema,
  // Callers in the admin UI may explicitly send null when no slot/reason is
  // selected, so accept null in addition to undefined.
  time_slot: z.enum(PRIVATE_SLOTS).nullish(),
  reason: z.string().trim().max(500).nullish(),
});

export type AvailabilityBlockInsert = z.infer<
  typeof AvailabilityBlockInsertSchema
>;
