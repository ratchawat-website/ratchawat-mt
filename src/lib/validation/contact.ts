import { z } from "zod";

export const ContactRequestSchema = z.object({
  name: z.string().trim().min(2, "Name too short").max(100, "Name too long"),
  email: z
    .string()
    .trim()
    .email("Invalid email")
    .max(254, "Email too long"),
  subject: z.string().trim().max(120, "Subject too long").optional().default(""),
  message: z
    .string()
    .trim()
    .min(10, "Message too short")
    .max(5000, "Message too long"),
});

export type ContactRequest = z.infer<typeof ContactRequestSchema>;

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
