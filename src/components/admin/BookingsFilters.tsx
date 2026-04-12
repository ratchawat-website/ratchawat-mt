"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const inputClass =
  "bg-surface-lowest border-2 border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors";

export default function BookingsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const current = useCallback(
    (key: string) => searchParams.get(key) ?? "",
    [searchParams],
  );

  const push = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      // Reset to page 1 on any filter change
      params.delete("page");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleReset = () => {
    router.push("?");
  };

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Type */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Type
        </label>
        <select
          value={current("type")}
          onChange={(e) => push({ type: e.target.value })}
          className={inputClass}
        >
          <option value="">All</option>
          <option value="training">Training</option>
          <option value="private">Private</option>
          <option value="camp-stay">Camp Stay</option>
          <option value="fighter">Fighter</option>
        </select>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Status
        </label>
        <select
          value={current("status")}
          onChange={(e) => push({ status: e.target.value })}
          className={inputClass}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* From */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
          From
        </label>
        <input
          type="date"
          value={current("from")}
          onChange={(e) => push({ from: e.target.value })}
          className={inputClass}
        />
      </div>

      {/* To */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
          To
        </label>
        <input
          type="date"
          value={current("to")}
          onChange={(e) => push({ to: e.target.value })}
          className={inputClass}
        />
      </div>

      {/* Search */}
      <div className="flex flex-col gap-1 flex-1 min-w-48">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Search
        </label>
        <input
          type="text"
          placeholder="Name or email..."
          value={current("q")}
          onChange={(e) => push({ q: e.target.value })}
          className={inputClass}
        />
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="px-4 py-2 text-sm font-semibold uppercase tracking-widest text-on-surface-variant border-2 border-outline-variant rounded-lg hover:border-primary hover:text-on-surface transition-colors"
      >
        Reset
      </button>
    </div>
  );
}
