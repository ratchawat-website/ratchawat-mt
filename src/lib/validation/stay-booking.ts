import { z } from "zod";

const DateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");

export const StayCheckoutSchema = z
  .object({
    unit: z.enum(["room", "bungalow"]),
    plan: z.enum(["normal", "fighter"]),
    check_in: DateString,
    check_out: DateString,
    client_name: z.string().trim().min(2).max(100),
    client_email: z.string().trim().email().max(200),
    client_phone: z.string().trim().min(6).max(30),
    client_nationality: z.string().trim().min(2).max(60).optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine((d) => d.check_out > d.check_in, {
    path: ["check_out"],
    message: "Check-out must be after check-in.",
  });

export type StayCheckoutRequest = z.infer<typeof StayCheckoutSchema>;
