import { describe, it, expect } from "vitest";
import { getInventoryKey, getStayUnitInventoryKey } from "./inventory";

describe("getInventoryKey", () => {
  it("maps new stay price ids", () => {
    expect(getInventoryKey("stay-room-normal")).toBe("rooms");
    expect(getInventoryKey("stay-room-fighter")).toBe("rooms");
    expect(getInventoryKey("stay-bungalow-normal")).toBe("bungalows");
    expect(getInventoryKey("stay-bungalow-fighter")).toBe("bungalows");
  });

  it("still maps historic package ids (live bookings depend on it)", () => {
    expect(getInventoryKey("camp-stay-1week")).toBe("rooms");
    expect(getInventoryKey("camp-stay-2weeks")).toBe("rooms");
    expect(getInventoryKey("camp-stay-1month")).toBe("rooms");
    expect(getInventoryKey("camp-stay-bungalow-monthly")).toBe("bungalows");
    expect(getInventoryKey("fighter-stay-room-monthly")).toBe("rooms");
    expect(getInventoryKey("fighter-stay-bungalow-monthly")).toBe("bungalows");
  });

  it("returns null for non-accommodation ids", () => {
    expect(getInventoryKey("private-adult-solo")).toBeNull();
    expect(getInventoryKey("fighter-monthly")).toBeNull();
  });
});

describe("getStayUnitInventoryKey", () => {
  it("maps units to pools", () => {
    expect(getStayUnitInventoryKey("room")).toBe("rooms");
    expect(getStayUnitInventoryKey("bungalow")).toBe("bungalows");
  });
});
