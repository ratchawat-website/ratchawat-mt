import { describe, it, expect } from "vitest";
import { resolveStayRange } from "./stay-range";

const d = (s: string) => new Date(s + "T00:00:00");
const FULL = new Set(["2026-07-18", "2026-07-19"]);

describe("resolveStayRange", () => {
  it("accepts a valid range", () => {
    const res = resolveStayRange(
      { from: d("2026-08-20"), to: d("2026-08-30") },
      d("2026-08-30"),
      FULL,
      7,
    );
    expect(res.error).toBeNull();
    expect(res.range).toEqual({ from: d("2026-08-20"), to: d("2026-08-30") });
  });

  it("starts a new selection when a complete range already exists", () => {
    // The user picked Aug 20 -> Sep 19, then clicks Aug 25 to change the
    // check-in. react-day-picker would only shrink the checkout; we restart
    // the selection at the clicked day instead.
    const res = resolveStayRange(
      { from: d("2026-08-20"), to: d("2026-08-25") },
      d("2026-08-25"),
      FULL,
      7,
      { from: d("2026-08-20"), to: d("2026-09-19") },
    );
    expect(res.error).toBeNull();
    expect(res.range).toEqual({ from: d("2026-08-25"), to: undefined });
  });

  it("does not restart when the previous selection was incomplete", () => {
    const res = resolveStayRange(
      { from: d("2026-08-20"), to: d("2026-08-30") },
      d("2026-08-30"),
      FULL,
      7,
      { from: d("2026-08-20"), to: undefined },
    );
    expect(res.error).toBeNull();
    expect(res.range).toEqual({ from: d("2026-08-20"), to: d("2026-08-30") });
  });

  it("passes through an incomplete selection", () => {
    const res = resolveStayRange(
      { from: d("2026-08-20"), to: undefined },
      d("2026-08-20"),
      FULL,
      7,
    );
    expect(res.error).toBeNull();
    expect(res.range).toEqual({ from: d("2026-08-20"), to: undefined });
  });

  it("keeps the anchor when the stay is too short", () => {
    const res = resolveStayRange(
      { from: d("2026-08-20"), to: d("2026-08-23") },
      d("2026-08-23"),
      FULL,
      7,
    );
    expect(res.error).toBe("Minimum stay is 7 nights.");
    expect(res.range).toEqual({ from: d("2026-08-20"), to: undefined });
  });

  it("restarts the selection at the clicked day on a sold-out conflict", () => {
    // Trap scenario: a stale July anchor + a click far away in September.
    // Keeping the anchor would make EVERY later click re-span the full
    // night and re-fail; the selection must restart at the clicked day.
    const res = resolveStayRange(
      { from: d("2026-07-15"), to: d("2026-09-25") },
      d("2026-09-25"),
      FULL,
      7,
    );
    expect(res.error).toBe("Sold out on Jul 18, 2026. Pick different dates.");
    expect(res.range).toEqual({ from: d("2026-09-25"), to: undefined });
  });

  it("does not flag the checkout night (hotel logic)", () => {
    // Checkout on the 18th frees that night: 11 -> 18 uses nights 11-17.
    const res = resolveStayRange(
      { from: d("2026-07-11"), to: d("2026-07-18") },
      d("2026-07-18"),
      FULL,
      7,
    );
    expect(res.error).toBeNull();
  });
});
