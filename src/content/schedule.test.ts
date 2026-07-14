import { describe, it, expect } from "vitest";
import {
  PRIVATE_SLOT_TIMES,
  SLOT_GROUPS,
  getCutoffHoursForSlot,
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
