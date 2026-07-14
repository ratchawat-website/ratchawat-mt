import type { SupabaseClient } from "@supabase/supabase-js";
import { PRIVATE_SLOT_CAPACITY } from "@/content/schedule";

export interface SlotQuery {
  date: string; // yyyy-MM-dd
  timeSlot: string; // HH:mm
  camp: "bo-phut" | "plai-laem";
}

/**
 * A slot can host up to PRIVATE_SLOT_CAPACITY parallel private sessions
 * per camp (one per available trainer).
 */
export function hasSlotCapacity(occupied: number, requested = 1): boolean {
  return occupied + requested <= PRIVATE_SLOT_CAPACITY;
}

/**
 * Hard closure: admin toggled the slot off for everyone, regardless of
 * per-camp capacity. One row is enough to refuse.
 */
export async function isSlotClosed(
  client: SupabaseClient,
  date: string,
  timeSlot: string,
): Promise<boolean> {
  const { count, error } = await client
    .from("availability_blocks")
    .select("id", { count: "exact", head: true })
    .eq("type", "private-slot-closure")
    .eq("is_blocked", true)
    .eq("date", date)
    .eq("time_slot", timeSlot);
  if (error) {
    throw new Error(`Slot closure check failed: ${error.message}`);
  }
  return (count ?? 0) > 0;
}

/**
 * Trainer units already booked on (date, timeSlot, camp). Each private
 * block consumes `units` trainers (legacy rows without units count as 1).
 */
export async function getSlotOccupancy(
  client: SupabaseClient,
  q: SlotQuery,
): Promise<number> {
  const { data, error } = await client
    .from("availability_blocks")
    .select("units")
    .eq("type", "private-slot")
    .eq("is_blocked", true)
    .eq("date", q.date)
    .eq("time_slot", q.timeSlot)
    .eq("camp", q.camp);
  if (error) {
    throw new Error(`Slot capacity check failed: ${error.message}`);
  }
  return (data ?? []).reduce(
    (sum, row) => sum + ((row as { units: number | null }).units ?? 1),
    0,
  );
}
