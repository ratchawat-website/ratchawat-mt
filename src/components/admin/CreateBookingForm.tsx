"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { PRICES, type PriceItem } from "@/content/pricing";
import { PRIVATE_SLOTS } from "@/lib/config/slots";
import { addDays, format } from "date-fns";

const BOOKING_TYPES = [
  { value: "training", label: "Training" },
  { value: "private", label: "Private Lesson" },
  { value: "camp-stay", label: "Camp Stay" },
  { value: "fighter", label: "Fighter Program" },
] as const;

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
  return PRICES.filter((p) => p.bookingType === type);
}

function needsEndDate(type: string): boolean {
  return type === "camp-stay" || type === "fighter";
}

function needsTimeSlot(type: string): boolean {
  return type === "private";
}

function getStayDurationDays(priceId: string): number | null {
  if (priceId.includes("1week")) return 7;
  if (priceId.includes("2weeks")) return 14;
  if (priceId.includes("1month") || priceId.includes("monthly")) return 30;
  if (priceId.includes("bungalow")) return 30;
  return null;
}

function getDefaultCamp(priceId: string | null, type: string): string {
  if (!priceId) return "bo-phut";
  if (priceId.includes("stay") || priceId.includes("bungalow")) return "plai-laem";
  if (type === "camp-stay") return "both";
  return "bo-phut";
}

export default function CreateBookingForm({ defaultDate, onClose }: Props) {
  const router = useRouter();
  const [type, setType] = useState("training");
  const [priceId, setPriceId] = useState("");
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

  // Auto-calculate price when package or participants change
  useEffect(() => {
    if (selectedPkg?.price) {
      setPriceAmount(selectedPkg.price * numParticipants);
    }
  }, [selectedPkg, numParticipants]);

  // Auto-set camp when package changes
  useEffect(() => {
    setCamp(getDefaultCamp(priceId, type));
  }, [priceId, type]);

  // Reset package when type changes
  useEffect(() => {
    setPriceId("");
    setTimeSlot("");
    setEndDate("");
  }, [type]);

  // Auto-calculate end_date from start_date + package duration
  useEffect(() => {
    if (!startDate || !priceId) return;
    const duration = getStayDurationDays(priceId);
    if (duration) {
      const start = new Date(startDate + "T00:00:00");
      const end = addDays(start, duration);
      setEndDate(format(end, "yyyy-MM-dd"));
    }
  }, [startDate, priceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!priceId || !startDate || !clientName) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          price_id: priceId,
          camp,
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
        </div>

        {/* Row 2: Camp + Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              onChange={(e) =>
                setNumParticipants(Math.max(1, parseInt(e.target.value) || 1))
              }
              min={1}
              max={10}
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
            disabled={submitting || !priceId || !startDate || !clientName}
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
