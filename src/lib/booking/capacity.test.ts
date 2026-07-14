import { describe, it, expect } from "vitest";
import { hasSlotCapacity } from "./capacity";

describe("hasSlotCapacity", () => {
  it("accepts when the slot is empty", () => {
    expect(hasSlotCapacity(0)).toBe(true);
  });

  it("accepts the 6th booking (5 occupied + 1 requested)", () => {
    expect(hasSlotCapacity(5)).toBe(true);
  });

  it("refuses the 7th booking (6 occupied)", () => {
    expect(hasSlotCapacity(6)).toBe(false);
  });

  it("refuses when the request alone would overflow (1 occupied + 6 requested)", () => {
    expect(hasSlotCapacity(1, 6)).toBe(false);
  });

  it("accepts a multi-unit request that fits exactly (2 occupied + 4 requested)", () => {
    expect(hasSlotCapacity(2, 4)).toBe(true);
  });
});
