"use client";

import { useEffect, useMemo, useState } from "react";
import DatePicker from "./DatePicker";
import { createClient } from "@/lib/supabase/browser";
import { Matcher } from "react-day-picker";
import { PRIVATE_SLOTS } from "@/lib/config/slots";
import { INVENTORY, type InventoryKey } from "@/lib/admin/inventory";
import { addDays, format } from "date-fns";

interface AvailabilityBlock {
  date: string;
  time_slot: string | null;
  type: string;
}

interface Props {
  type: "private" | "camp-stay";
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  onAvailableSlotsChange?: (slots: string[]) => void;
  inventoryKey?: InventoryKey;
  stayDurationDays?: number;
}

export default function AvailabilityCalendar({
  type,
  selected,
  onSelect,
  onAvailableSlotsChange,
  inventoryKey,
  stayDurationDays,
}: Props) {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [occupancy, setOccupancy] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const from = format(today, "yyyy-MM-dd");
    const to = format(addDays(today, 180), "yyyy-MM-dd");

    const supabase = createClient();
    // Compute block types to fetch based on booking type:
    // - private sessions are blocked by full closures, full-day private blocks, and per-slot blocks
    // - camp-stay / fighter are only blocked by full closures
    const blockTypes =
      type === "private"
        ? ["full", "private", "private-slot"]
        : ["full"];
    const blocksPromise = supabase
      .from("availability_blocks")
      .select("date, time_slot, type")
      .in("type", blockTypes)
      .eq("is_blocked", true)
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load availability:", error);
          return [];
        }
        return data ?? [];
      });

    const occupancyPromise = inventoryKey
      ? fetch(
          `/api/availability/occupancy?key=${inventoryKey}&from=${from}&to=${to}`,
        )
          .then((r) => r.json())
          .then((json) => (json.occupancy ?? {}) as Record<string, number>)
          .catch((err) => {
            console.error("Failed to load occupancy:", err);
            return {};
          })
      : Promise.resolve({});

    Promise.all([blocksPromise, occupancyPromise]).then(
      ([blocksData, occupancyData]) => {
        setBlocks(blocksData as AvailabilityBlock[]);
        setOccupancy(occupancyData);
        setLoading(false);
      },
    );
  }, [type, inventoryKey]);

  const disabledDays: Matcher[] = useMemo(() => {
    const blockedDates = new Set<string>();
    const dateSlotMap = new Map<string, Set<string>>();

    for (const block of blocks) {
      // "full" and "private" block the entire day; "private-slot" blocks an individual slot
      if (block.type === "full" || block.type === "private" || !block.time_slot) {
        blockedDates.add(block.date);
      } else {
        if (!dateSlotMap.has(block.date)) dateSlotMap.set(block.date, new Set());
        dateSlotMap.get(block.date)!.add(block.time_slot);
      }
    }

    if (type === "private") {
      for (const [date, slots] of dateSlotMap.entries()) {
        if (slots.size >= PRIVATE_SLOTS.length) blockedDates.add(date);
      }
    }

    // Capacity-based blocking
    if (inventoryKey) {
      const capacity = INVENTORY[inventoryKey];
      const duration = stayDurationDays ?? 1;

      // For multi-night stays, block check-in date if ANY night during the stay is at capacity
      // For single-day, block any day at capacity
      if (duration > 1) {
        // Iterate all possible check-in dates in the occupancy window
        for (const [dateStr, count] of Object.entries(occupancy)) {
          if (count < capacity) continue;
          // This night is full — find all check-in dates whose stay overlaps this night.
          // A check-in on D occupies nights D, D+1, ..., D+(duration-1).
          // Night N is blocked if D <= N <= D+(duration-1), i.e. N-(duration-1) <= D <= N.
          const nightDate = new Date(dateStr + "T00:00:00");
          for (let offset = 0; offset < duration; offset++) {
            const checkInDate = new Date(
              nightDate.getTime() - offset * 86400000,
            );
            blockedDates.add(format(checkInDate, "yyyy-MM-dd"));
          }
        }
      } else {
        for (const [dateStr, count] of Object.entries(occupancy)) {
          if (count >= capacity) blockedDates.add(dateStr);
        }
      }
    }

    return Array.from(blockedDates).map((d) => new Date(d + "T00:00:00"));
  }, [blocks, type, occupancy, inventoryKey, stayDurationDays]);

  useEffect(() => {
    if (!selected || type !== "private" || !onAvailableSlotsChange) return;
    // Use date-fns `format` (local time) rather than toISOString() which
    // shifts to UTC and can silently skip a day in timezones ahead of UTC.
    const dateStr = format(selected, "yyyy-MM-dd");
    const blockedSlotsForDate = new Set(
      blocks
        .filter((b) => b.date === dateStr && b.time_slot)
        .map((b) => b.time_slot as string),
    );
    const available = PRIVATE_SLOTS.filter((s) => !blockedSlotsForDate.has(s));
    onAvailableSlotsChange(available);
  }, [selected, blocks, type, onAvailableSlotsChange]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (loading) {
    return (
      <div className="h-80 bg-surface-lowest rounded-[var(--radius-card)] animate-pulse" />
    );
  }

  return (
    <DatePicker
      selected={selected}
      onSelect={onSelect}
      minDate={tomorrow}
      disabledDays={disabledDays}
    />
  );
}
