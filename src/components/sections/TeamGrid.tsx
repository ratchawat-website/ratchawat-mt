"use client";

import { useState } from "react";
import Image from "next/image";
import GlassCard from "@/components/ui/GlassCard";
import {
  type Trainer,
  type Camp,
  trainerCampLabel,
} from "@/content/trainers";

interface TeamGridProps {
  trainers: Trainer[];
}

type Filter = "all" | Camp;

export default function TeamGrid({ trainers }: TeamGridProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered =
    filter === "all"
      ? trainers
      : trainers.filter((t) => t.camps.includes(filter));

  const counts = {
    all: trainers.length,
    "bo-phut": trainers.filter((t) => t.camps.includes("bo-phut")).length,
    "plai-laem": trainers.filter((t) => t.camps.includes("plai-laem")).length,
  };

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "bo-phut", label: "Bo Phut", count: counts["bo-phut"] },
    { key: "plai-laem", label: "Plai Laem", count: counts["plai-laem"] },
  ];

  return (
    <>
      <div
        className="flex flex-wrap justify-center gap-2 mb-10"
        role="tablist"
      >
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
        {filtered.map((trainer) => (
          <GlassCard key={trainer.id} hover={true} className="flex flex-col">
            <div className="relative aspect-[3/4] rounded-card overflow-hidden mb-5">
              {trainer.image ? (
                <Image
                  src={trainer.image}
                  alt={trainer.imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  style={{ objectPosition: trainer.pos ?? "center" }}
                />
              ) : (
                <div
                  aria-label={trainer.imageAlt}
                  role="img"
                  className="absolute inset-0 bg-gradient-to-br from-slate-800 via-gray-900 to-zinc-800"
                />
              )}
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-lg font-bold text-on-surface uppercase leading-tight">
                {trainer.name}
              </h3>
              <span className="badge-underline badge-neutral text-[10px] shrink-0 ml-2">
                {trainerCampLabel(trainer)}
              </span>
            </div>
            <p className="mb-3">
              <span className="badge-underline badge-orange">{trainer.role}</span>
            </p>
            <p className="text-on-surface-variant text-xs leading-relaxed mb-4 flex-1">
              {trainer.bio}
            </p>
            <div className="flex flex-wrap gap-2">
              {trainer.specialties.map((s) => (
                <span
                  key={s}
                  className="text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-outline-variant text-on-surface-variant"
                >
                  {s}
                </span>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-on-surface-variant text-sm mt-8">
          No trainers to display for this selection.
        </p>
      )}
    </>
  );
}
