import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
  // Freeze time so the fixture dates above stay in the future forever
  // (the schema now rejects past start dates for non-private types).
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T05:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

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

describe("start_date floor (Bangkok calendar)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 2026-07-16 12:00 Bangkok (05:00 UTC).
    vi.setSystemTime(new Date("2026-07-16T05:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const base = {
    price_id: "training-dropin",
    type: "training" as const,
    camp: "bo-phut" as const,
    client_name: "Test Client",
    client_email: "test@example.com",
    client_phone: "0630802876",
  };

  it("rejects a past start_date for training", () => {
    const result = BookingRequestSchema.safeParse({
      ...base,
      start_date: "2026-07-15",
    });
    expect(result.success).toBe(false);
  });

  it("accepts today (Bangkok) as start_date", () => {
    const result = BookingRequestSchema.safeParse({
      ...base,
      start_date: "2026-07-16",
    });
    expect(result.success).toBe(true);
  });

  it("still accepts past dates for private (cutoff handles those)", () => {
    const result = BookingRequestSchema.safeParse({
      ...base,
      type: "private",
      start_date: "2026-07-10",
      sessions: [{ date: "2026-07-10", time_slot: "13:00" }],
    });
    expect(result.success).toBe(true);
  });
});
