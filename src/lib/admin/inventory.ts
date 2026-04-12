export const INVENTORY = {
  rooms: 7,
  bungalows: 1,
} as const;

export type InventoryKey = "rooms" | "bungalows";

/**
 * Maps a price_id to its inventory pool.
 * Returns null for bookings that don't consume accommodation.
 */
export function getInventoryKey(priceId: string): InventoryKey | null {
  if (priceId.includes("bungalow")) return "bungalows";
  if (
    priceId.includes("camp-stay-room") ||
    priceId.startsWith("camp-stay-1week") ||
    priceId.startsWith("camp-stay-2weeks") ||
    priceId.startsWith("camp-stay-1month") ||
    priceId === "fighter-stay-room-monthly"
  ) {
    return "rooms";
  }
  return null;
}
