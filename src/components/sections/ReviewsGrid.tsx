"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Star, Quote } from "lucide-react";
import {
  type Review,
  type Camp,
  CAMP_LABELS,
  CAMP_STATS,
  reviewDisplayDate,
} from "@/content/reviews";

interface ReviewsGridProps {
  reviews: Review[];
}

type Filter = "all" | Camp;

export default function ReviewsGrid({ reviews }: ReviewsGridProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered =
    filter === "all" ? reviews : reviews.filter((r) => r.camp === filter);

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: reviews.length },
    {
      key: "bo-phut",
      label: CAMP_LABELS["bo-phut"],
      count: reviews.filter((r) => r.camp === "bo-phut").length,
    },
    {
      key: "plai-laem",
      label: CAMP_LABELS["plai-laem"],
      count: reviews.filter((r) => r.camp === "plai-laem").length,
    },
  ];

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2 mb-8" role="tablist">
        {tabs.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-full border-2 text-xs uppercase tracking-[0.19em] font-semibold transition-colors ${
                active
                  ? "bg-primary border-primary text-surface"
                  : "border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 text-[10px] ${
                  active ? "opacity-80" : "opacity-60"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((review) => (
          <GlassCard key={review.id} hover={false}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-0.5">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="text-primary fill-primary"
                  />
                ))}
              </div>
              <span className="badge-underline badge-neutral text-[10px]">
                {CAMP_LABELS[review.camp]}
              </span>
            </div>
            <Quote size={20} className="text-primary/40 mb-2" />
            <p className="text-[#ccc] italic text-xs leading-relaxed mb-4">
              {review.text}
            </p>
            <div className="border-t border-outline-variant pt-3 flex items-center justify-between">
              <div>
                <p className="text-on-surface font-semibold text-sm flex items-center gap-2">
                  {review.author}
                  {review.flag && (
                    <span
                      aria-label={`${review.language.toUpperCase()} review`}
                      className="text-base"
                    >
                      {review.flag}
                    </span>
                  )}
                </p>
                <p className="text-on-surface-variant text-[11px]">
                  {reviewDisplayDate(review)}
                </p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-on-surface-variant text-sm mt-8">
          No reviews to display for this selection.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
        {(Object.keys(CAMP_STATS) as Camp[]).map((camp) => {
          const stats = CAMP_STATS[camp];
          return (
            <GlassCard key={camp} hover={false} className="text-center">
              <p className="text-xs uppercase tracking-[0.19em] text-primary font-semibold mb-2">
                {CAMP_LABELS[camp]}
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-primary fill-primary"
                    />
                  ))}
                </div>
                <span className="font-serif text-2xl font-bold text-primary">
                  {stats.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-on-surface-variant text-xs mt-1">
                Verified Google reviews
              </p>
            </GlassCard>
          );
        })}
      </div>
    </>
  );
}
