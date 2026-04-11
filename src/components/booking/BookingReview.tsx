"use client";

import GlassCard from "@/components/ui/GlassCard";

interface ReviewRow {
  label: string;
  value: string;
}

interface Props {
  rows: ReviewRow[];
  totalAmount: number;
  note?: string;
}

export default function BookingReview({ rows, totalAmount, note }: Props) {
  return (
    <GlassCard hover={false}>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
        Booking Summary
      </h3>
      <div className="space-y-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <span className="text-on-surface-variant">{row.label}</span>
            <span className="text-on-surface font-medium text-right">
              {row.value}
            </span>
          </div>
        ))}
        <div className="flex justify-between pt-2 border-t border-outline-variant">
          <span className="text-on-surface font-semibold">Total</span>
          <span className="font-serif text-xl font-bold text-primary">
            {totalAmount.toLocaleString("en-US")} THB
          </span>
        </div>
      </div>
      {note && (
        <p className="text-on-surface-variant text-xs mt-4 leading-relaxed">
          {note}
        </p>
      )}
    </GlassCard>
  );
}
