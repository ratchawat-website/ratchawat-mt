import { describe, it, expect } from "vitest";
import {
  computeBookingAmount,
  getStripeQuantity,
  getCapacityUnits,
  getParticipantBounds,
} from "./pricing";

describe("computeBookingAmount", () => {
  it("multiplies per-person items by participants (historic behavior)", () => {
    expect(computeBookingAmount({ price: 1000, billing: "per-person" }, 3)).toBe(3000);
  });

  it("defaults to per-person when billing is undefined", () => {
    expect(computeBookingAmount({ price: 400 }, 2)).toBe(800);
  });

  it("keeps flat items at the listed price regardless of participants", () => {
    expect(computeBookingAmount({ price: 1400, billing: "flat" }, 2)).toBe(1400);
    expect(computeBookingAmount({ price: 1400, billing: "flat" }, 3)).toBe(1400);
  });

  it("returns 0 for null price", () => {
    expect(computeBookingAmount({ price: null }, 2)).toBe(0);
  });
});

describe("getCapacityUnits", () => {
  it("per-participant items consume one trainer per participant", () => {
    expect(getCapacityUnits({ capacity: "per-participant" }, 4)).toBe(4);
  });

  it("per-session items consume one trainer regardless of participants", () => {
    expect(getCapacityUnits({ capacity: "per-session" }, 3)).toBe(1);
  });

  it("defaults to per-session when capacity is undefined", () => {
    expect(getCapacityUnits({}, 3)).toBe(1);
  });
});

describe("getParticipantBounds", () => {
  it("returns the item bounds when present", () => {
    expect(getParticipantBounds({ participants: { min: 2, max: 3 } })).toEqual({ min: 2, max: 3 });
  });

  it("defaults to exactly one participant", () => {
    expect(getParticipantBounds({})).toEqual({ min: 1, max: 1 });
  });
});

describe("getStripeQuantity", () => {
  it("bills one line item per participant on per-person items", () => {
    expect(getStripeQuantity({ billing: "per-person" }, 3)).toBe(3);
    expect(getStripeQuantity({}, 2)).toBe(2);
  });

  it("bills a single line item on flat items", () => {
    expect(getStripeQuantity({ billing: "flat" }, 3)).toBe(1);
  });
});
