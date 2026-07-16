import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { bangkokSlotInstant, todayInBangkok } from "./bangkok-time";

describe("bangkokSlotInstant", () => {
  it("converts a Bangkok wall-clock slot to the correct UTC instant", () => {
    // 09:30 in Bangkok (UTC+7) is 02:30 UTC.
    expect(bangkokSlotInstant("2026-07-16", "09:30")).toBe(
      Date.parse("2026-07-16T02:30:00Z"),
    );
  });

  it("handles midnight-adjacent slots without shifting the date", () => {
    // 07:00 Bangkok is 00:00 UTC the same day.
    expect(bangkokSlotInstant("2026-07-16", "07:00")).toBe(
      Date.parse("2026-07-16T00:00:00Z"),
    );
  });
});

describe("todayInBangkok", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the Bangkok calendar date, not the UTC one", () => {
    // 17:30 UTC = 00:30 next day in Bangkok.
    vi.setSystemTime(new Date("2026-07-16T17:30:00Z"));
    expect(todayInBangkok()).toBe("2026-07-17");
  });

  it("matches UTC date while both calendars agree", () => {
    // 05:00 UTC = 12:00 Bangkok, same calendar day.
    vi.setSystemTime(new Date("2026-07-16T05:00:00Z"));
    expect(todayInBangkok()).toBe("2026-07-16");
  });
});
