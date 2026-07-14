"use client";

import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import DateRangePicker from "./DateRangePicker";
import { INVENTORY, type InventoryKey } from "@/lib/admin/inventory";
import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  startOfToday,
  subDays,
} from "date-fns";

interface Props {
  inventoryKey: InventoryKey;
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  minNights: number;
}

export default function StayCalendar({
  inventoryKey,
  range,
  onRangeChange,
  minNights,
}: Props) {
  const [occupancy, setOccupancy] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [rangeError, setRangeError] = useState<string | null>(null);

  useEffect(() => {
    const from = format(startOfToday(), "yyyy-MM-dd");
    const to = format(addDays(startOfToday(), 180), "yyyy-MM-dd");
    fetch(`/api/availability/occupancy?key=${inventoryKey}&from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((json) =>
        setOccupancy((json.occupancy ?? {}) as Record<string, number>),
      )
      .catch((err) => {
        console.error("Failed to load occupancy:", err);
        setOccupancy({});
      })
      .finally(() => setLoading(false));
  }, [inventoryKey]);

  const fullNights = useMemo(() => {
    const capacity = INVENTORY[inventoryKey];
    return new Set(
      Object.entries(occupancy)
        .filter(([, count]) => count >= capacity)
        .map(([date]) => date),
    );
  }, [occupancy, inventoryKey]);

  const disabledDays = useMemo(
    () => Array.from(fullNights).map((d) => new Date(d + "T00:00:00")),
    [fullNights],
  );

  const handleSelect = (next: DateRange | undefined) => {
    setRangeError(null);
    if (next?.from && next?.to) {
      const nights = differenceInCalendarDays(next.to, next.from);
      if (nights < minNights) {
        setRangeError(`Minimum stay is ${minNights} nights.`);
        onRangeChange({ from: next.from, to: undefined });
        return;
      }
      // Every night of the stay must have a free unit (checkout night excluded).
      const nightsList = eachDayOfInterval({
        start: next.from,
        end: subDays(next.to, 1),
      });
      const conflict = nightsList.find((n) =>
        fullNights.has(format(n, "yyyy-MM-dd")),
      );
      if (conflict) {
        setRangeError(
          `Sold out on ${format(conflict, "MMM d, yyyy")}. Pick different dates.`,
        );
        onRangeChange({ from: next.from, to: undefined });
        return;
      }
    }
    onRangeChange(next);
  };

  if (loading) {
    return (
      <div className="h-80 bg-surface-lowest rounded-[var(--radius-card)] animate-pulse" />
    );
  }

  return (
    <div className="space-y-3">
      <DateRangePicker
        range={range}
        onSelect={handleSelect}
        minDate={addDays(startOfToday(), 1)}
        disabledDays={disabledDays}
      />
      {rangeError && (
        <p className="text-sm text-primary" role="alert">
          {rangeError}
        </p>
      )}
    </div>
  );
}
