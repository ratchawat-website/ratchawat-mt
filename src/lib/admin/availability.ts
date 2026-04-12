import { createAdminClient } from "@/lib/supabase/admin";
import { INVENTORY, type InventoryKey, getInventoryKey } from "./inventory";
import { eachDayOfInterval, parseISO, subDays, format } from "date-fns";

interface BookingRange {
  start_date: string;
  end_date: string | null;
  price_id: string;
}

/**
 * Returns occupancy count per day for a date range and inventory pool.
 * Counts bookings with status IN ('pending','confirmed').
 */
export async function getOccupancyMap(
  inventoryKey: InventoryKey,
  fromDate: string,
  toDate: string,
): Promise<Map<string, number>> {
  const supabase = createAdminClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("start_date, end_date, price_id")
    .in("type", ["camp-stay", "fighter"])
    .in("status", ["pending", "confirmed"])
    .lte("start_date", toDate)
    .gte("end_date", fromDate);

  if (error) {
    console.error("Failed to load occupancy:", error);
    return new Map();
  }

  const map = new Map<string, number>();

  for (const booking of bookings as BookingRange[]) {
    const bookingInventory = getInventoryKey(booking.price_id);
    if (bookingInventory !== inventoryKey) continue;
    if (!booking.end_date) continue;

    // Hotel logic: checkout morning frees the night.
    // Stay from Apr 15 to Apr 22 occupies nights 15,16,17,18,19,20,21 (not 22).
    const lastNight = subDays(parseISO(booking.end_date), 1);
    const nights = eachDayOfInterval({
      start: parseISO(booking.start_date),
      end: lastNight,
    });

    for (const night of nights) {
      const key = format(night, "yyyy-MM-dd");
      if (key >= fromDate && key <= toDate) {
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
  }

  return map;
}

/**
 * Returns available units for a single day.
 */
export async function getAvailableUnits(
  inventoryKey: InventoryKey,
  date: string,
): Promise<number> {
  const map = await getOccupancyMap(inventoryKey, date, date);
  const occupied = map.get(date) ?? 0;
  return Math.max(0, INVENTORY[inventoryKey] - occupied);
}

/**
 * Checks if an entire stay range has capacity.
 * Returns OK or the first conflict date.
 */
export async function checkRangeAvailability(
  inventoryKey: InventoryKey,
  startDate: string,
  endDate: string,
): Promise<{ ok: true } | { ok: false; conflictDate: string }> {
  const lastNight = format(subDays(parseISO(endDate), 1), "yyyy-MM-dd");
  const map = await getOccupancyMap(inventoryKey, startDate, lastNight);
  const capacity = INVENTORY[inventoryKey];

  const nights = eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(lastNight),
  });

  for (const night of nights) {
    const key = format(night, "yyyy-MM-dd");
    const occupied = map.get(key) ?? 0;
    if (occupied >= capacity) {
      return { ok: false, conflictDate: key };
    }
  }

  return { ok: true };
}
