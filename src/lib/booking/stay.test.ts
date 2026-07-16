import { describe, it, expect } from "vitest";
import {
  computeStayPrice,
  stayNights,
  stayLabelFromPriceId,
  StayPricingError,
} from "./stay";

describe("stayLabelFromPriceId", () => {
  it("labels stay ids", () => {
    expect(stayLabelFromPriceId("stay-room-normal")).toBe("Standard Room");
    expect(stayLabelFromPriceId("stay-bungalow-fighter")).toBe("Fighter Program + Private Bungalow");
  });

  it("returns null for non-stay ids", () => {
    expect(stayLabelFromPriceId("private-adult-solo")).toBeNull();
  });
});

describe("stayNights", () => {
  it("counts hotel nights (checkout morning frees the night)", () => {
    expect(stayNights("2026-08-01", "2026-08-08")).toBe(7);
  });
});

describe("computeStayPrice: room normal", () => {
  it("rejects below the 7-night minimum", () => {
    expect(() => computeStayPrice("2026-08-01", "2026-08-07", "room", "normal")).toThrow(StayPricingError);
  });

  it.each([
    ["2026-08-01", "2026-08-08", 8000],   // 7 nights = base week
    ["2026-08-01", "2026-08-14", 14840],  // 13 nights = 8000 + 6x1140
    ["2026-08-01", "2026-08-15", 15000],  // 14 nights = special tier
    ["2026-08-01", "2026-08-16", 16140],  // 15 nights = 15000 + 1140
    ["2026-08-01", "2026-08-30", 32100],  // 29 nights = 15000 + 15x1140 (known anomaly vs 30)
    ["2026-08-01", "2026-08-31", 18000],  // 30 nights = monthly base
    ["2026-08-01", "2026-09-15", 27000],  // 45 nights = 18000 + 15x600
  ])("prices %s -> %s at %i THB", (checkIn, checkOut, expected) => {
    expect(computeStayPrice(checkIn, checkOut, "room", "normal").total).toBe(expected);
  });
});

describe("computeStayPrice: other cards", () => {
  it("room fighter: 30 nights = 20000, extra night 670", () => {
    expect(computeStayPrice("2026-08-01", "2026-08-31", "room", "fighter").total).toBe(20000);
    expect(computeStayPrice("2026-08-01", "2026-09-01", "room", "fighter").total).toBe(20670);
  });

  it("bungalow normal: rejects under 30 nights, 31 nights = 23760 (extra night 760)", () => {
    expect(() => computeStayPrice("2026-08-01", "2026-08-30", "bungalow", "normal")).toThrow(StayPricingError);
    expect(computeStayPrice("2026-08-01", "2026-09-01", "bungalow", "normal").total).toBe(23760);
  });

  it("bungalow fighter: 30 nights = 25500, extra night 850", () => {
    expect(computeStayPrice("2026-08-01", "2026-08-31", "bungalow", "fighter").total).toBe(25500);
    expect(computeStayPrice("2026-08-01", "2026-09-01", "bungalow", "fighter").total).toBe(26350);
  });

  it("exposes the breakdown", () => {
    const quote = computeStayPrice("2026-08-01", "2026-08-16", "room", "normal");
    expect(quote).toMatchObject({
      nights: 15,
      tierNights: 14,
      basePrice: 15000,
      extraNights: 1,
      extraNightRate: 1140,
    });
  });

  it("rejects checkout before checkin", () => {
    expect(() => computeStayPrice("2026-08-10", "2026-08-01", "room", "normal")).toThrow(StayPricingError);
  });
});
