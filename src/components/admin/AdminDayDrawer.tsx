"use client";

import { useState } from "react";
import { format } from "date-fns";
import { X, Lock } from "lucide-react";
import { PRIVATE_SLOTS } from "@/lib/config/slots";
import { INVENTORY } from "@/lib/admin/inventory";

export interface BlockRecord {
  id: string;
  date: string;
  type: string;
  time_slot: string | null;
  reason: string | null;
}

interface Props {
  date: Date;
  roomsOccupied: number;
  bungalowsOccupied: number;
  blocks: BlockRecord[];
  onClose: () => void;
  onRefresh: () => void;
}

const BLOCK_TYPES = [
  { type: "private", label: "Block all private sessions" },
  { type: "full", label: "Block everything (camp closed)" },
] as const;

async function createBlock(
  date: string,
  type: string,
  time_slot?: string | null,
  reason?: string | null,
): Promise<string | null> {
  const res = await fetch("/api/admin/availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, type, time_slot, reason }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.id ?? null;
}

async function removeBlock(id: string): Promise<boolean> {
  const res = await fetch(`/api/admin/availability/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

export default function AdminDayDrawer({
  date,
  roomsOccupied,
  bungalowsOccupied,
  blocks,
  onClose,
  onRefresh,
}: Props) {
  const dateStr = format(date, "yyyy-MM-dd");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  function hasExactBlock(type: string, time_slot: string | null): BlockRecord | undefined {
    return blocks.find((b) => b.type === type && b.time_slot === time_slot);
  }

  async function toggleMainBlock(type: string) {
    const existing = hasExactBlock(type, null);
    const key = `main-${type}`;
    setLoading(key);
    try {
      if (existing) {
        await removeBlock(existing.id);
      } else {
        await createBlock(dateStr, type, null, reason || null);
      }
      onRefresh();
    } finally {
      setLoading(null);
    }
  }

  async function toggleSlotBlock(slot: string) {
    const existing = hasExactBlock("private-slot", slot);
    const key = `slot-${slot}`;
    setLoading(key);
    try {
      if (existing) {
        await removeBlock(existing.id);
      } else {
        await createBlock(dateStr, "private-slot", slot, reason || null);
      }
      onRefresh();
    } finally {
      setLoading(null);
    }
  }

  const roomPct = roomsOccupied / INVENTORY.rooms;
  const bungalowFull = bungalowsOccupied >= INVENTORY.bungalows;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Day details for ${format(date, "MMMM d, yyyy")}`}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-surface border-l-2 border-outline-variant shadow-2xl flex flex-col overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-outline-variant sticky top-0 bg-surface z-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              {format(date, "EEEE")}
            </p>
            <h2 className="text-xl font-bold text-on-surface">
              {format(date, "MMMM d, yyyy")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-lowest transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 px-5 py-4 space-y-6">
          {/* Occupancy */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
              Occupancy
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-surface-lowest rounded-lg px-4 py-3 border-2 border-outline-variant">
                <span className="text-sm font-medium text-on-surface">
                  Rooms
                </span>
                <span
                  className={`text-sm font-bold ${
                    roomsOccupied >= INVENTORY.rooms
                      ? "text-red-400"
                      : roomPct >= 0.75
                        ? "text-amber-400"
                        : "text-green-400"
                  }`}
                >
                  {roomsOccupied} / {INVENTORY.rooms}
                </span>
              </div>
              <div className="flex items-center justify-between bg-surface-lowest rounded-lg px-4 py-3 border-2 border-outline-variant">
                <span className="text-sm font-medium text-on-surface">
                  Bungalow
                </span>
                <span
                  className={`text-sm font-bold ${bungalowFull ? "text-red-400" : "text-green-400"}`}
                >
                  {bungalowsOccupied} / {INVENTORY.bungalows}
                </span>
              </div>
            </div>
          </section>

          {/* Quick actions */}
          <section>
            <a
              href={`/admin/bookings?create=1&date=${dateStr}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-primary bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              + Create Booking for {format(date, "MMM d")}
            </a>
          </section>

          {/* Reason field */}
          <section>
            <label
              htmlFor="block-reason"
              className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2"
            >
              Reason (optional)
            </label>
            <input
              id="block-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Thai holiday, maintenance..."
              className="w-full bg-surface-lowest border-2 border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
            />
          </section>

          {/* Manual blocks */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-2">
              <Lock size={12} />
              Manual Blocks
            </h3>
            <div className="space-y-2">
              {BLOCK_TYPES.map(({ type, label }) => {
                const existing = hasExactBlock(type, null);
                const key = `main-${type}`;
                const isLoading = loading === key;
                return (
                  <button
                    key={type}
                    onClick={() => toggleMainBlock(type)}
                    disabled={isLoading}
                    className={[
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                      existing
                        ? "border-red-500 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                        : "border-outline-variant bg-surface-lowest text-on-surface hover:border-primary/50",
                      isLoading && "opacity-60 cursor-not-allowed",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span>{label}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {isLoading ? "..." : existing ? "ON" : "OFF"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Private time slots */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
              Private Session Slots
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {PRIVATE_SLOTS.map((slot) => {
                const existing = hasExactBlock("private-slot", slot);
                const key = `slot-${slot}`;
                const isLoading = loading === key;
                return (
                  <button
                    key={slot}
                    onClick={() => toggleSlotBlock(slot)}
                    disabled={isLoading}
                    className={[
                      "flex items-center justify-between px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                      existing
                        ? "border-red-500 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                        : "border-outline-variant bg-surface-lowest text-on-surface hover:border-primary/50",
                      isLoading && "opacity-60 cursor-not-allowed",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span>{slot}</span>
                    <span className="text-[10px] font-bold uppercase">
                      {isLoading ? "..." : existing ? "ON" : "OFF"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Active blocks list */}
          {blocks.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
                Active blocks ({blocks.length})
              </h3>
              <div className="space-y-2">
                {blocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-start justify-between gap-3 bg-surface-lowest border-2 border-red-500/40 rounded-lg px-3 py-2.5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-red-300 uppercase tracking-wide">
                        {block.type}
                        {block.time_slot ? ` @ ${block.time_slot}` : ""}
                      </p>
                      {block.reason && (
                        <p className="text-xs text-on-surface-variant truncate mt-0.5">
                          {block.reason}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        setLoading(`del-${block.id}`);
                        await removeBlock(block.id);
                        onRefresh();
                        setLoading(null);
                      }}
                      disabled={loading === `del-${block.id}`}
                      className="text-xs font-semibold text-on-surface-variant hover:text-red-400 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      aria-label={`Remove block ${block.id}`}
                    >
                      {loading === `del-${block.id}` ? "..." : "Remove"}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}
