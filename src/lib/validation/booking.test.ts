import { describe, it, expect } from "vitest";
import { BookingRequestSchema } from "./booking";

const base = {
  price_id: "private-adult-solo",
  type: "private" as const,
  camp: "bo-phut" as const,
  start_date: "2026-08-03",
  client_name: "Test Client",
  client_email: "test@example.com",
  client_phone: "+66123456789",
};

describe("BookingRequestSchema sessions", () => {
  it("accepts a private booking with multiple sessions across days", () => {
    const parsed = BookingRequestSchema.safeParse({
      ...base,
      sessions: [
        { date: "2026-08-03", time_slot: "10:30" },
        { date: "2026-08-05", time_slot: "19:00" },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a private booking with zero sessions", () => {
    const parsed = BookingRequestSchema.safeParse({ ...base, sessions: [] });
    expect(parsed.success).toBe(false);
  });

  it("rejects duplicate date+slot entries", () => {
    const parsed = BookingRequestSchema.safeParse({
      ...base,
      sessions: [
        { date: "2026-08-03", time_slot: "10:30" },
        { date: "2026-08-03", time_slot: "10:30" },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects more than 10 sessions", () => {
    const sessions = Array.from({ length: 11 }, (_, i) => ({
      date: `2026-08-${String(i + 1).padStart(2, "0")}`,
      time_slot: "10:30",
    }));
    const parsed = BookingRequestSchema.safeParse({ ...base, sessions });
    expect(parsed.success).toBe(false);
  });

  it("still accepts non-private bookings without sessions", () => {
    const parsed = BookingRequestSchema.safeParse({
      ...base,
      price_id: "drop-in-adult",
      type: "training",
    });
    expect(parsed.success).toBe(true);
  });
});
