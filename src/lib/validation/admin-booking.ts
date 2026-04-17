import { z } from "zod";
import { PRIVATE_SLOTS } from "@/lib/config/slots";

export const AdminBookingSchema = z.object({
  type: z.enum(["training", "private", "camp-stay", "fighter", "dtv"]),
  price_id: z.string().min(1),
  camp: z.enum(["bo-phut", "plai-laem", "both"]),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time_slot: z.enum(PRIVATE_SLOTS).optional(),
  num_participants: z.number().int().min(1).max(10).default(1),
  client_name: z.string().trim().min(1).max(100),
  client_email: z.string().trim().email().max(200).optional().or(z.literal("")),
  client_phone: z.string().trim().max(30).optional().or(z.literal("")),
  client_nationality: z.string().trim().max(60).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  price_amount: z.number().int().min(0).optional(),
});

export type AdminBookingRequest = z.infer<typeof AdminBookingSchema>;
