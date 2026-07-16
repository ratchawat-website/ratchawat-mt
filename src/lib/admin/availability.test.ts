import { describe, it, expect } from "vitest";
import { firstOverbookedNight } from "./availability";

describe("firstOverbookedNight", () => {
  it("returns null when every night is at or under capacity", () => {
    const map = new Map([
      ["2026-08-01", 1],
      ["2026-08-02", 1],
    ]);
    expect(firstOverbookedNight(map, 1, "2026-08-01", "2026-08-03")).toBeNull();
  });

  it("returns the first night strictly over capacity", () => {
    const map = new Map([
      ["2026-08-01", 1],
      ["2026-08-02", 2],
    ]);
    expect(firstOverbookedNight(map, 1, "2026-08-01", "2026-08-03")).toBe(
      "2026-08-02",
    );
  });

  it("ignores the checkout day (hotel logic)", () => {
    // Stay Aug 1 -> Aug 3 occupies nights 1 and 2 only.
    const map = new Map([["2026-08-03", 99]]);
    expect(firstOverbookedNight(map, 1, "2026-08-01", "2026-08-03")).toBeNull();
  });
});
