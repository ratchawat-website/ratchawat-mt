import { NextResponse } from "next/server";
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

  const map = await getOccupancyMap(inventoryKey, from, to);
  const occupancy: Record<string, number> = {};
  for (const [date, count] of map.entries()) {
    occupancy[date] = count;
  }

  return NextResponse.json({ occupancy });
}
