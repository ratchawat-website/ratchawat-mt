"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { PRICES, type PriceItem } from "@/content/pricing";
import {
  getRateCard,
  stayPriceId,
  type StayPlan,
  type StayUnit,
} from "@/content/stay-pricing";
import { computeStayPrice } from "@/lib/booking/stay";
import { PRIVATE_SLOTS } from "@/lib/config/slots";
import {
  computeBookingAmount,
  getParticipantBounds,
} from "@/lib/booking/pricing";
import { addDays, format } from "date-fns";

// "stay" is a UI-only type: the POST maps it to camp-stay/fighter + stay fields.
const BOOKING_TYPES = [
  { value: "training", label: "Training" },
  { value: "private", label: "Private Lesson" },
  { value: "stay", label: "Accommodation Stay" },
  { value: "camp-stay", label: "Camp Stay" },
  { value: "fighter", label: "Fighter Program" },
] as const;

const STAY_UNITS: { value: StayUnit; label: string }[] = [
  { value: "room", label: "Room" },
  { value: "bungalow", label: "Bungalow" },
];

const STAY_PLANS: { value: StayPlan; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "fighter", label: "Fighter Program" },
];

const CAMPS = [
  { value: "bo-phut", label: "Bo Phut" },
  { value: "plai-laem", label: "Plai Laem" },
  { value: "both", label: "Both (Plai Laem stay)" },
] as const;

interface Props {
  defaultDate?: string;
  onClose: () => void;
}

function getPackagesForType(type: string): PriceItem[] {
  return PRICES.filter((p) => p.bookingType === type && !p.archived);
}

function needsEndDate(type: string): boolean {
  return type === "stay" || type === "camp-stay" || type === "fighter";
}

function needsTimeSlot(type: string): boolean {
  return type === "private";
}

function getDefaultCamp(priceId: string | null, type: string): string {
  if (type === "stay") return "both";
  if (!priceId) return "bo-phut";
  if (priceId.includes("stay") || priceId.includes("bungalow")) return "plai-laem";
  if (type === "camp-stay") return "both";
  return "bo-phut";
}

export default function CreateBookingForm({ defaultDate, onClose }: Props) {
  const router = useRouter();
  const [type, setType] = useState("training");
  const [priceId, setPriceId] = useState("");
  const [stayUnit, setStayUnit] = useState<StayUnit | "">("");
  const [stayPlan, setStayPlan] = useState<StayPlan | "">("");
  const [camp, setCamp] = useState("bo-phut");
  const [startDate, setStartDate] = useState(defaultDate ?? "");
  const [endDate, setEndDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [numParticipants, setNumParticipants] = useState(1);
  const [priceAmount, setPriceAmount] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const packages = getPackagesForType(type);
  const selectedPkg = PRICES.find((p) => p.id === priceId);
  const bounds = selectedPkg
    ? getParticipantBounds(selectedPkg)
    : { min: 1, max: 1 };

  // Auto-calculate price when package or participants change
  useEffect(() => {
    if (selectedPkg?.price) {
      setPriceAmount(computeBookingAmount(selectedPkg, numParticipants));
    }
  }, [selectedPkg, numParticipants]);

  // Re-clamp participants when the selected package changes its bounds
  useEffect(() => {
    setNumParticipants((n) => Math.min(Math.max(n, bounds.min), bounds.max));
  }, [bounds.min, bounds.max]);

  // Auto-set camp when package changes
  useEffect(() => {
    setCamp(getDefaultCamp(priceId, type));
  }, [priceId, type]);

  // Reset package when type changes
  useEffect(() => {
    setPriceId("");
    setStayUnit("");
    setStayPlan("");
    setTimeSlot("");
    setEndDate("");
  }, [type]);

  // Stay: auto-fill the amount from the tiered grid (manual override kept:
  // the admin can still edit the field afterwards).
  useEffect(() => {
    if (type !== "stay" || !stayUnit || !stayPlan || !startDate || !endDate)
      return;
    try {
      setPriceAmount(computeStayPrice(startDate, endDate, stayUnit, stayPlan).total);
    } catch {
      setPriceAmount("");
    }
  }, [type, stayUnit, stayPlan, startDate, endDate]);

  // Stay convenience: when the end date is still empty, suggest the minimum
  // stay. The field stays fully editable.
  useEffect(() => {
    if (type !== "stay" || !stayUnit || !stayPlan || !startDate || endDate)
      return;
    const card = getRateCard(stayUnit, stayPlan);
    if (!card) return;
    setEndDate(
      format(
        addDays(new Date(startDate + "T00:00:00"), card.minNights),
        "yyyy-MM-dd",
      ),
    );
  }, [type, stayUnit, stayPlan, startDate, endDate]);

  const isStay = type === "stay";
  const canSubmit = isStay
    ? !!stayUnit && !!stayPlan && !!startDate && !!endDate && !!clientName
    : !!priceId && !!startDate && !!clientName;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    const stayBody =
      isStay && stayUnit && stayPlan
        ? {
            type: stayPlan === "fighter" ? "fighter" : "camp-stay",
            price_id: stayPriceId(stayUnit, stayPlan),
            stay_unit: stayUnit,
            stay_plan: stayPlan,
            camp: stayPlan === "fighter" ? "plai-laem" : "both",
          }
        : { type, price_id: priceId, camp };

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...stayBody,
          start_date: startDate,
          end_date: endDate || undefined,
          time_slot: timeSlot || undefined,
          num_participants: numParticipants,
          client_name: clientName,
          client_email: clientEmail || undefined,
          client_phone: clientPhone || undefined,
          client_nationality: nationality || undefined,
          notes: notes || undefined,
          price_amount: typeof priceAmount === "number" ? priceAmount : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create booking");
        return;
      }

      onClose();
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full bg-surface-lowest border-2 border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5";
  const selectClass = `${inputClass} appearance-none`;

  return (
    <div className="bg-surface border-2 border-primary/30 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg font-bold text-on-surface uppercase tracking-tight">
          Create Booking
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-lowest transition-colors"
          aria-label="Close form"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Type + Package */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={selectClass}
            >
              {BOOKING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          {isStay ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Unit</label>
                <select
                  value={stayUnit}
                  onChange={(e) => setStayUnit(e.target.value as StayUnit | "")}
                  className={selectClass}
                  required
                >
                  <option value="">Select unit...</option>
                  {STAY_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Plan</label>
                <select
                  value={stayPlan}
                  onChange={(e) => setStayPlan(e.target.value as StayPlan | "")}
                  className={selectClass}
                  required
                >
                  <option value="">Select plan...</option>
                  {STAY_PLANS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className={labelClass}>Package</label>
              <select
                value={priceId}
                onChange={(e) => setPriceId(e.target.value)}
                className={selectClass}
                required
              >
                <option value="">Select package...</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.nameShort} — {pkg.price?.toLocaleString("en-US") ?? "?"} THB
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Row 2: Camp + Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {!isStay && (
            <div>
              <label className={labelClass}>Camp</label>
              <select
                value={camp}
                onChange={(e) => setCamp(e.target.value)}
                className={selectClass}
              >
                {CAMPS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className={labelClass}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          {needsEndDate(type) && (
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
          {needsTimeSlot(type) && (
            <div>
              <label className={labelClass}>Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className={selectClass}
                required
              >
                <option value="">Select slot...</option>
                {PRIVATE_SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Row 3: Client info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Walk-in guest"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Email (optional)</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="client@example.com"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Phone (optional)</label>
            <input
              type="text"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="+66..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nationality (optional)</label>
            <input
              type="text"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="e.g. French"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Participants</label>
            <input
              type="number"
              value={numParticipants}
              onChange={(e) => {
                const parsed = parseInt(e.target.value) || bounds.min;
                setNumParticipants(
                  Math.min(Math.max(parsed, bounds.min), bounds.max),
                );
              }}
              min={bounds.min}
              max={bounds.max}
              className={inputClass}
            />
          </div>
        </div>

        {/* Row 4: Amount + Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Amount (THB)</label>
            <input
              type="number"
              value={priceAmount}
              onChange={(e) => {
                const val = e.target.value;
                setPriceAmount(val === "" ? "" : parseInt(val) || 0);
              }}
              min={0}
              className={inputClass}
              placeholder="Auto-calculated"
            />
            <p className="text-[10px] text-on-surface-variant mt-1">
              Auto-filled from package. Edit to override.
            </p>
          </div>
          <div>
            <label className={labelClass}>Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Error + Submit */}
        {error && (
          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !canSubmit}
            className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          >
            {submitting ? "Creating..." : "Create Booking"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border-2 border-outline-variant text-on-surface-variant text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
