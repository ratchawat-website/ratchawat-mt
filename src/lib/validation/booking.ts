import { z } from "zod";
import { PRIVATE_SLOTS } from "@/lib/config/slots";

export const BookingTypeSchema = z.enum([
  "training",
  "private",
  "camp-stay",
  "fighter",
]);

export const CampSchema = z.enum(["bo-phut", "plai-laem", "both"]);

export const TimeSlotSchema = z.enum(PRIVATE_SLOTS);

export const BookingRequestSchema = z.object({
  price_id: z.string().min(1),
  type: BookingTypeSchema,
  camp: CampSchema,
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  time_slot: TimeSlotSchema.optional(),
  num_participants: z.number().int().min(1).max(3).default(1),
  client_name: z.string().trim().min(2).max(100),
  client_email: z.string().trim().email().max(200),
  client_phone: z.string().trim().min(6).max(30),
  client_nationality: z.string().trim().min(2).max(60).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type BookingRequest = z.infer<typeof BookingRequestSchema>;
