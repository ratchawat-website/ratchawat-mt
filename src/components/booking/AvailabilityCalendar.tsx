"use client";

import { useEffect, useMemo, useState } from "react";
import DatePicker from "./DatePicker";
import { createClient } from "@/lib/supabase/browser";
import { Matcher } from "react-day-picker";

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
}

const ALL_SLOTS = ["09:00", "11:00", "14:00", "16:00"];

export default function AvailabilityCalendar({
  type,
  selected,
  onSelect,
  onAvailableSlotsChange,
}: Props) {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("availability_blocks")
      .select("date, time_slot, type")
      .in("type", [type, "all"])
      .eq("is_blocked", true)
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load availability:", error);
        } else {
          setBlocks(data ?? []);
        }
        setLoading(false);
      });
  }, [type]);

  const disabledDays: Matcher[] = useMemo(() => {
    const blockedDates = new Set<string>();
    const dateSlotMap = new Map<string, Set<string>>();

    for (const block of blocks) {
      if (!block.time_slot) {
        blockedDates.add(block.date);
      } else {
        if (!dateSlotMap.has(block.date)) dateSlotMap.set(block.date, new Set());
        dateSlotMap.get(block.date)!.add(block.time_slot);
      }
    }

    if (type === "private") {
      for (const [date, slots] of dateSlotMap.entries()) {
        if (slots.size >= ALL_SLOTS.length) blockedDates.add(date);
      }
    }

    return Array.from(blockedDates).map((d) => new Date(d + "T00:00:00"));
  }, [blocks, type]);

  useEffect(() => {
    if (!selected || type !== "private" || !onAvailableSlotsChange) return;
    const dateStr = selected.toISOString().split("T")[0];
    const blockedSlotsForDate = new Set(
      blocks
        .filter((b) => b.date === dateStr && b.time_slot)
        .map((b) => b.time_slot as string),
    );
    const available = ALL_SLOTS.filter((s) => !blockedSlotsForDate.has(s));
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
