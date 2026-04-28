"use client";

import { useEffect, useMemo, useState } from "react";
import DatePicker from "./DatePicker";
import { createClient } from "@/lib/supabase/browser";
import { Matcher } from "react-day-picker";
import { PRIVATE_SLOTS } from "@/lib/config/slots";
import { PRIVATE_SLOT_CAPACITY } from "@/content/schedule";
import { INVENTORY, type InventoryKey } from "@/lib/admin/inventory";
import { addDays, format, startOfToday } from "date-fns";

interface AvailabilityBlock {
  date: string;
  time_slot: string | null;
  type: string;
  camp: string | null;
}

interface Props {
  type: "private" | "camp-stay";
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  onAvailableSlotsChange?: (slots: string[]) => void;
  inventoryKey?: InventoryKey;
  stayDurationDays?: number;
  /**
   * Camp filter for private bookings. Per-slot blocks only count toward
   * capacity for the camp they belong to, so availability must be
   * computed per camp. Required once the user has picked a camp upstream.
   */
  camp?: "bo-phut" | "plai-laem";
}

export default function AvailabilityCalendar({
  type,
  selected,
  onSelect,
  onAvailableSlotsChange,
  inventoryKey,
  stayDurationDays,
  camp,
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
        ? ["full", "private", "private-slot", "private-slot-closure"]
        : ["full"];
    const blocksPromise = supabase
      .from("availability_blocks")
      .select("date, time_slot, type, camp")
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
    // For private bookings we track occupancy per slot per camp so we can
    // tell whether an entire day is saturated (every slot × relevant
    // camps at capacity). For simple full-day blocks we just flag the
    // date.
    const dateSlotCampCount = new Map<string, Map<string, number>>();
    // Hard closures (admin "block this slot for everyone"): one row is
    // enough to disable the slot regardless of trainer capacity.
    const dateHardClosedSlots = new Map<string, Set<string>>();

    for (const block of blocks) {
      if (block.type === "full" || block.type === "private" || !block.time_slot) {
        blockedDates.add(block.date);
      } else if (block.type === "private-slot-closure") {
        if (!dateHardClosedSlots.has(block.date)) {
          dateHardClosedSlots.set(block.date, new Set());
        }
        dateHardClosedSlots.get(block.date)!.add(block.time_slot);
      } else if (block.type === "private-slot") {
        // Only count blocks relevant to the selected camp (or all if no
        // camp filter yet; in that case any camp counts).
        if (camp && block.camp && block.camp !== camp) continue;
        if (!dateSlotCampCount.has(block.date)) {
          dateSlotCampCount.set(block.date, new Map());
        }
        const slotMap = dateSlotCampCount.get(block.date)!;
        slotMap.set(block.time_slot, (slotMap.get(block.time_slot) ?? 0) + 1);
      }
    }

    if (type === "private") {
      // A day is fully blocked when every slot is either at capacity or
      // hard-closed by admin.
      const allDates = new Set<string>([
        ...dateSlotCampCount.keys(),
        ...dateHardClosedSlots.keys(),
      ]);
      for (const date of allDates) {
        const slotMap = dateSlotCampCount.get(date) ?? new Map<string, number>();
        const closedSet = dateHardClosedSlots.get(date) ?? new Set<string>();
        const unavailableSlots = new Set<string>(closedSet);
        for (const [slot, n] of slotMap.entries()) {
          if (n >= PRIVATE_SLOT_CAPACITY) unavailableSlots.add(slot);
        }
        if (unavailableSlots.size >= PRIVATE_SLOTS.length) {
          blockedDates.add(date);
        }
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
  }, [blocks, type, occupancy, inventoryKey, stayDurationDays, camp]);

  useEffect(() => {
    if (!selected || type !== "private" || !onAvailableSlotsChange) return;
    // Use date-fns `format` (local time) rather than toISOString() which
    // shifts to UTC and can silently skip a day in timezones ahead of UTC.
    const dateStr = format(selected, "yyyy-MM-dd");
    // Count existing private-slot blocks per slot for the selected camp
    // (or overall if no camp yet). A slot is unavailable only once it has
    // hit PRIVATE_SLOT_CAPACITY, since the camps run several trainers in
    // parallel. Full-day blocks fall through to the calendar-level grey
    // out above, not here.
    const slotCounts = new Map<string, number>();
    const hardClosedSlots = new Set<string>();
    for (const b of blocks) {
      if (b.date !== dateStr || !b.time_slot) continue;
      if (b.type === "private-slot-closure") {
        hardClosedSlots.add(b.time_slot);
        continue;
      }
      if (b.type !== "private-slot") continue;
      if (camp && b.camp && b.camp !== camp) continue;
      slotCounts.set(b.time_slot, (slotCounts.get(b.time_slot) ?? 0) + 1);
    }
    const available = PRIVATE_SLOTS.filter(
      (s) =>
        !hardClosedSlots.has(s) &&
        (slotCounts.get(s) ?? 0) < PRIVATE_SLOT_CAPACITY,
    );
    onAvailableSlotsChange(available);
  }, [selected, blocks, type, onAvailableSlotsChange, camp]);

  // Private sessions can be booked same-day: the per-slot cutoff (2h, or 12h
  // for 7:00/8:00 slots) handles which slots are still bookable today, so the
  // calendar must keep today selectable. Camp stays remain next-day-onward.
  const minDate = type === "private" ? startOfToday() : addDays(startOfToday(), 1);

  if (loading) {
    return (
      <div className="h-80 bg-surface-lowest rounded-[var(--radius-card)] animate-pulse" />
    );
  }

  return (
    <DatePicker
      selected={selected}
      onSelect={onSelect}
      minDate={minDate}
      disabledDays={disabledDays}
    />
  );
}
