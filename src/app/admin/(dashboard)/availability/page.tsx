"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import AdminCalendar, { type DayData } from "@/components/admin/AdminCalendar";
import AdminDayDrawer, {
  type BlockRecord,
} from "@/components/admin/AdminDayDrawer";

export default function AdminAvailabilityPage() {
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayDataMap, setDayDataMap] = useState<Record<string, DayData>>({});
  const [blocks, setBlocks] = useState<BlockRecord[]>([]);
  const [drawerBlocks, setDrawerBlocks] = useState<BlockRecord[]>([]);

  const loadData = useCallback(async () => {
    const from = format(startOfMonth(month), "yyyy-MM-dd");
    const to = format(endOfMonth(month), "yyyy-MM-dd");

    // Fetch occupancy for rooms + bungalows in parallel
    const [roomsRes, bungalowsRes] = await Promise.all([
      fetch(`/api/availability/occupancy?key=rooms&from=${from}&to=${to}`),
      fetch(`/api/availability/occupancy?key=bungalows&from=${from}&to=${to}`),
    ]);

    const roomsData = roomsRes.ok ? await roomsRes.json() : { occupancy: {} };
    const bungalowsData = bungalowsRes.ok
      ? await bungalowsRes.json()
      : { occupancy: {} };

    const roomsOcc: Record<string, number> = roomsData.occupancy ?? {};
    const bungalowsOcc: Record<string, number> = bungalowsData.occupancy ?? {};

    // Fetch availability blocks from Supabase (public read)
    const supabase = createClient();
    const { data: blockRows } = await supabase
      .from("availability_blocks")
      .select("id, date, type, time_slot, reason")
      .gte("date", from)
      .lte("date", to);

    const blockList: BlockRecord[] = (blockRows ?? []).map((b) => ({
      id: String(b.id),
      date: String(b.date),
      type: String(b.type),
      time_slot: b.time_slot ? String(b.time_slot) : null,
      reason: b.reason ? String(b.reason) : null,
    }));

    setBlocks(blockList);

    // Build dayDataMap
    const allDates = new Set([
      ...Object.keys(roomsOcc),
      ...Object.keys(bungalowsOcc),
      ...blockList.map((b) => b.date),
    ]);

    const map: Record<string, DayData> = {};
    for (const d of allDates) {
      const hasBlock = blockList.some(
        (b) =>
          b.date === d &&
          (b.type === "full" || b.type === "private"),
      );
      map[d] = {
        rooms: roomsOcc[d] ?? 0,
        bungalows: bungalowsOcc[d] ?? 0,
        hasBlock,
      };
    }

    setDayDataMap(map);

    // Refresh drawer blocks if a date is selected
    if (selectedDate) {
      const selKey = format(selectedDate, "yyyy-MM-dd");
      setDrawerBlocks(blockList.filter((b) => b.date === selKey));
    }
  }, [month, selectedDate]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  function handleDayClick(date: Date) {
    const key = format(date, "yyyy-MM-dd");
    setDrawerBlocks(blocks.filter((b) => b.date === key));
    setSelectedDate(date);
  }

  function handleClose() {
    setSelectedDate(null);
    setDrawerBlocks([]);
  }

  async function handleRefresh() {
    await loadData();
  }

  const selectedKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedData = selectedKey ? dayDataMap[selectedKey] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-bold text-on-surface uppercase tracking-tight">
            Availability
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Manage blocks and view occupancy by day
          </p>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="p-2 rounded-lg border-2 border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-sm font-semibold text-on-surface min-w-[9rem] text-center">
            {format(month, "MMMM yyyy")}
          </span>

          <button
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="p-2 rounded-lg border-2 border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
          75%+ full
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
          Full
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-amber-400">R</span> = Rooms (/{7})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-green-400">B</span> = Bungalow (/1)
        </span>
      </div>

      {/* Calendar */}
      <div className="bg-surface border-2 border-outline-variant rounded-xl p-4">
        <AdminCalendar
          month={month}
          dayDataMap={dayDataMap}
          onDayClick={handleDayClick}
          selectedDate={selectedDate}
        />
      </div>

      {/* Day Drawer */}
      {selectedDate && (
        <AdminDayDrawer
          date={selectedDate}
          roomsOccupied={selectedData?.rooms ?? 0}
          bungalowsOccupied={selectedData?.bungalows ?? 0}
          blocks={drawerBlocks}
          onClose={handleClose}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}
