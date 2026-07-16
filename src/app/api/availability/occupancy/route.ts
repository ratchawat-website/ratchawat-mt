import { NextResponse } from "next/server";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { getOccupancyMap } from "@/lib/admin/availability";
import type { InventoryKey } from "@/lib/admin/inventory";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inventoryKey = searchParams.get("key") as InventoryKey | null;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!inventoryKey || !from || !to) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  if (inventoryKey !== "rooms" && inventoryKey !== "bungalows") {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  if (!DATE_RE.test(from) || !DATE_RE.test(to) || from > to) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }
  // Public endpoint: cap the window to keep the occupancy scan bounded.
  if (differenceInCalendarDays(parseISO(to), parseISO(from)) > 366) {
    return NextResponse.json({ error: "Range too large" }, { status: 400 });
  }

  const map = await getOccupancyMap(inventoryKey, from, to);
  const occupancy: Record<string, number> = {};
  for (const [date, count] of map.entries()) {
    occupancy[date] = count;
  }

  return NextResponse.json({ occupancy });
}
