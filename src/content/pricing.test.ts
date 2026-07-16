import { describe, it, expect } from "vitest";
import { getPriceById } from "./pricing";
import {
  computeBookingAmount,
  getStripeQuantity,
  getCapacityUnits,
} from "../lib/booking/pricing";

describe("catalog: private-adult-group (client correction 2026-07-16)", () => {
  const item = getPriceById("private-adult-group")!;

  it("is billed per person at 700 THB", () => {
    expect(item.price).toBe(700);
    expect(item.billing).toBeUndefined();
    expect(computeBookingAmount(item, 2)).toBe(1400);
    expect(computeBookingAmount(item, 3)).toBe(2100);
  });

  it("bills one Stripe quantity per participant but consumes one trainer", () => {
    expect(getStripeQuantity(item, 3)).toBe(3);
    expect(getCapacityUnits(item, 3)).toBe(1);
  });
});
