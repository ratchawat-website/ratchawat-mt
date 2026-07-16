import { z } from "zod";
import { PRIVATE_SLOTS } from "@/lib/config/slots";
import { todayInBangkok } from "@/lib/utils/bangkok-time";

export const BookingTypeSchema = z.enum([
  "training",
  "private",
  "camp-stay",
  "fighter",
  "dtv",
]);

export const CampSchema = z.enum(["bo-phut", "plai-laem", "both"]);

export const TimeSlotSchema = z.enum(PRIVATE_SLOTS);

export const SessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time_slot: TimeSlotSchema,
});

export const BookingRequestSchema = z
  .object({
    price_id: z.string().min(1),
    type: BookingTypeSchema,
    camp: CampSchema,
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    time_slot: TimeSlotSchema.optional(),
    num_participants: z.number().int().min(1).max(6).default(1),
    client_name: z.string().trim().min(2).max(100),
    client_email: z.string().trim().email().max(200),
    client_phone: z.string().trim().min(6).max(30),
    client_nationality: z.string().trim().min(2).max(60).optional(),
    notes: z.string().trim().max(1000).optional(),
    sessions: z.array(SessionSchema).min(1).max(10).optional(),
  })
  .superRefine((data, ctx) => {
    // Private sessions are covered by the per-slot cutoff (stricter than a
    // date floor). Everything else must not start in the past, judged on
    // the Bangkok calendar since server and visitors run in other zones.
    if (data.type !== "private" && data.start_date < todayInBangkok()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["start_date"],
        message: "Start date cannot be in the past.",
      });
    }
    if (data.type === "private") {
      if (!data.sessions || data.sessions.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sessions"],
          message: "Private bookings need at least one session.",
        });
        return;
      }
      const keys = new Set(
        data.sessions.map((s) => `${s.date}|${s.time_slot}`),
      );
      if (keys.size !== data.sessions.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sessions"],
          message: "Duplicate session in cart.",
        });
      }
    }
  });

export type BookingRequest = z.infer<typeof BookingRequestSchema>;
