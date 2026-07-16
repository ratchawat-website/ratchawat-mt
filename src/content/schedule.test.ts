import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  PRIVATE_SLOT_TIMES,
  SLOT_GROUPS,
  getCutoffHoursForSlot,
  isSlotWithinCutoff,
} from "./schedule";

describe("PRIVATE_SLOT_TIMES", () => {
  it("contains the 19 client-approved slots in order", () => {
    expect(PRIVATE_SLOT_TIMES).toEqual([
      "07:00", "07:30", "08:00", "08:30", "09:00",
      "10:30", "11:00", "11:30", "12:00", "12:30",
      "13:00", "13:30", "14:00", "14:30", "15:00",
      "15:30", "16:00", "18:30", "19:00",
    ]);
  });

  it("groups cover every slot exactly once", () => {
    const grouped = SLOT_GROUPS.flatMap((g) => g.slots);
    expect(grouped).toEqual([...PRIVATE_SLOT_TIMES]);
  });
});

describe("getCutoffHoursForSlot", () => {
  it("requires 12h notice before 09:30", () => {
    for (const slot of ["07:00", "07:30", "08:00", "08:30", "09:00"]) {
      expect(getCutoffHoursForSlot(slot)).toBe(12);
    }
  });

  it("requires 2h notice from 10:30 onward", () => {
    for (const slot of ["10:30", "12:00", "16:00", "18:30", "19:00"]) {
      expect(getCutoffHoursForSlot(slot)).toBe(2);
    }
  });
});

describe("isSlotWithinCutoff (Bangkok wall-clock)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("blocks a 2h-cutoff slot booked 1h before Bangkok time", () => {
    // Now: 05:00 UTC = 12:00 Bangkok. Slot 13:00 Bangkok starts in 1h.
    vi.setSystemTime(new Date("2026-07-16T05:00:00Z"));
    expect(isSlotWithinCutoff("2026-07-16", "13:00")).toBe(true);
  });

  it("allows a 2h-cutoff slot booked 3h before Bangkok time", () => {
    // Now: 05:00 UTC = 12:00 Bangkok. Slot 15:00 Bangkok starts in 3h.
    vi.setSystemTime(new Date("2026-07-16T05:00:00Z"));
    expect(isSlotWithinCutoff("2026-07-16", "15:00")).toBe(false);
  });

  it("blocks a slot that already started", () => {
    // Now: 08:00 UTC = 15:00 Bangkok. Slot 13:00 Bangkok started 2h ago.
    vi.setSystemTime(new Date("2026-07-16T08:00:00Z"));
    expect(isSlotWithinCutoff("2026-07-16", "13:00")).toBe(true);
  });

  it("blocks an early slot 11h before (12h cutoff)", () => {
    // Now: 15:00 UTC on the 15th = 22:00 Bangkok. Slot 09:00 Bangkok
    // on the 16th starts in 11h.
    vi.setSystemTime(new Date("2026-07-15T15:00:00Z"));
    expect(isSlotWithinCutoff("2026-07-16", "09:00")).toBe(true);
  });

  it("allows an early slot 13h before (12h cutoff)", () => {
    // Now: 13:00 UTC on the 15th = 20:00 Bangkok.
    vi.setSystemTime(new Date("2026-07-15T13:00:00Z"));
    expect(isSlotWithinCutoff("2026-07-16", "09:00")).toBe(false);
  });
});
