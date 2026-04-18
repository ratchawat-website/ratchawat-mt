import { z } from "zod";

const DTV_PRICE_IDS = ["dtv-6m-2x", "dtv-6m-4x", "dtv-6m-unlimited"] as const;

export const DtvPriceIdSchema = z.enum(DTV_PRICE_IDS);

const DateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");

export const DtvApplicationSchema = z
  .object({
    first_name: z.string().trim().min(1).max(80),
    last_name: z.string().trim().min(1).max(80),
    nationality: z.string().trim().min(2).max(60),
    phone: z.string().trim().min(6).max(30),
    email: z.string().trim().email().max(200),

    passport_number: z.string().trim().min(4).max(30),
    passport_expiry: DateString,

    currently_in_thailand: z.boolean(),
    training_start_date: DateString,
    arrival_date: DateString,

    price_id: DtvPriceIdSchema,
    committed: z.literal(true, {
      message: "You must confirm the commitment.",
    }),
  })
  .superRefine((data, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(`${data.passport_expiry}T00:00:00`);
    const sixMonthsOut = new Date(today);
    sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);
    if (expiry < sixMonthsOut) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["passport_expiry"],
        message: "Passport must be valid for at least 6 more months.",
      });
    }

    const arrival = new Date(`${data.arrival_date}T00:00:00`);
    const start = new Date(`${data.training_start_date}T00:00:00`);
    if (arrival > start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["arrival_date"],
        message: "Arrival date must be on or before training start date.",
      });
    }
  });

export type DtvApplicationInput = z.infer<typeof DtvApplicationSchema>;
