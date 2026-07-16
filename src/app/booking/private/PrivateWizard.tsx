"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import BookingWizard from "@/components/booking/BookingWizard";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";
import ContactInfoForm, {
  ContactInfo,
  isContactInfoValid,
} from "@/components/booking/ContactInfoForm";
import BookingReview from "@/components/booking/BookingReview";
import { MapPin, MessageCircle } from "lucide-react";
import { getPricesByBookingType, getPriceById } from "@/content/pricing";
import { PRIVATE_SLOTS } from "@/lib/config/slots";
import {
  PRIVATE_BOOKING_WHATSAPP_FALLBACK,
  SLOT_GROUPS,
  getCutoffHoursForSlot,
  buildWhatsAppUrl,
  isSlotWithinCutoff,
} from "@/content/schedule";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { useTurnstile } from "@/components/security/use-turnstile";
import { formatDateLong } from "@/lib/utils/date-format";
import {
  computeBookingAmount,
  getParticipantBounds,
  getCapacityUnits,
} from "@/lib/booking/pricing";
import { PRIVATE_CANCELLATION_POLICY } from "@/content/policies";
import { format } from "date-fns";

const STEPS = ["Session type", "Camp", "Date & Time", "Contact", "Review"];

// Computed once at module load; reference stays stable across re-renders.
const PRIVATE_PACKAGES = getPricesByBookingType("private");

const CAMPS = [
  {
    id: "bo-phut" as const,
    name: "Bo Phut",
    description: "Soi Sunday, near Fisherman's Village",
  },
  {
    id: "plai-laem" as const,
    name: "Plai Laem",
    description: "Plai Laem Soi 13, near Big Buddha",
  },
];

const DEFAULT_CONTACT: ContactInfo = {
  name: "",
  email: "",
  phone: "",
  nationality: "",
  numParticipants: 1,
  notes: "",
};

export default function PrivateWizard() {
  const searchParams = useSearchParams();
  const packages = PRIVATE_PACKAGES;

  const [step, setStep] = useState(0);
  const [priceId, setPriceId] = useState<string | null>(null);
  const [camp, setCamp] = useState<"bo-phut" | "plai-laem" | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [sessions, setSessions] = useState<{ date: string; slot: string }[]>(
    [],
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([...PRIVATE_SLOTS]);
  const [contact, setContact] = useState<ContactInfo>(DEFAULT_CONTACT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const captcha = useTurnstile();

  // Consume `?package=` on mount only. Running once prevents the effect from
  // re-firing later and snapping the step back when the user clicks Continue.
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const pkg = searchParams.get("package");
    if (pkg && PRIVATE_PACKAGES.some((p) => p.id === pkg)) {
      setPriceId(pkg);
      setStep(1);
    }
  }, [searchParams]);

  const selectedPackage = priceId ? getPriceById(priceId) : null;
  const bounds = selectedPackage
    ? getParticipantBounds(selectedPackage)
    : { min: 1, max: 1 };
  const isPack = priceId === "private-adult-10pack";
  const maxSessions = isPack ? 1 : 10;
  const units = selectedPackage
    ? getCapacityUnits(selectedPackage, contact.numParticipants)
    : 1;

  // Package or camp change invalidates the cart (price and capacity change).
  useEffect(() => {
    setSessions([]);
  }, [priceId, camp]);

  // Keep num_participants inside the selected package's allowed range.
  useEffect(() => {
    setContact((c) => {
      const clamped = Math.min(
        Math.max(c.numParticipants, bounds.min),
        bounds.max,
      );
      return clamped === c.numParticipants
        ? c
        : { ...c, numParticipants: clamped };
    });
  }, [bounds.min, bounds.max]);

  const totalAmount = selectedPackage
    ? computeBookingAmount(selectedPackage, contact.numParticipants) *
      Math.max(sessions.length, 1)
    : 0;

  const canProceed = () => {
    if (step === 0) return !!priceId;
    if (step === 1) return !!camp;
    if (step === 2) return sessions.length >= 1;
    if (step === 3) return isContactInfoValid(contact);
    if (step === 4) return isContactInfoValid(contact) && captcha.ready;
    return false;
  };

  const sortedSessions = () =>
    sessions
      .slice()
      .sort((a, b) => `${a.date}${a.slot}`.localeCompare(`${b.date}${b.slot}`));

  const handleSubmit = async () => {
    if (!selectedPackage || !camp || sessions.length === 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const ordered = sortedSessions();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_id: selectedPackage.id,
          type: "private",
          camp,
          start_date: ordered[0].date,
          sessions: ordered.map((s) => ({ date: s.date, time_slot: s.slot })),
          num_participants: contact.numParticipants,
          client_name: contact.name,
          client_email: contact.email,
          client_phone: contact.phone,
          client_nationality: contact.nationality || undefined,
          notes: contact.notes || undefined,
          cf_turnstile_token: captcha.token,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Failed to start checkout");
      }
    } catch {
      setError("Network error. Please try again or contact us on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BookingWizard
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      canProceed={canProceed()}
      isFinalStep={step === 4}
      isSubmitting={isSubmitting}
      submitLabel={`Pay ${totalAmount.toLocaleString("en-US")} THB`}
      onSubmit={handleSubmit}
    >
      {/* Step 0: Session type */}
      {step === 0 && (
        <div className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Select Session Type
          </h2>
          {packages.map((pkg) => (
            <button
              type="button"
              key={pkg.id}
              onClick={() => setPriceId(pkg.id)}
              className={`w-full text-left rounded-[var(--radius-card)] p-4 sm:p-5 border-2 transition-all ${
                priceId === pkg.id
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant bg-surface-lowest hover:border-outline"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="font-serif text-base font-semibold text-on-surface">
                    {pkg.name}
                  </span>
                  <p className="text-on-surface-variant text-sm mt-0.5">
                    {pkg.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-serif text-lg font-bold text-primary">
                    {pkg.price?.toLocaleString("en-US")} THB
                  </span>
                  <p className="text-on-surface-variant text-xs">
                    / {pkg.unit}
                  </p>
                </div>
              </div>
            </button>
          ))}
          {selectedPackage && bounds.max > 1 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-on-surface-variant mb-2">
                Number of participants
              </label>
              <select
                value={contact.numParticipants}
                onChange={(e) =>
                  setContact((c) => ({
                    ...c,
                    numParticipants: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface focus:border-primary focus:outline-none transition-colors"
              >
                {Array.from(
                  { length: bounds.max - bounds.min + 1 },
                  (_, i) => i + bounds.min,
                ).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "person" : "people"}
                  </option>
                ))}
              </select>
              {selectedPackage.capacity === "per-participant" && (
                <p className="text-xs text-on-surface-variant mt-1.5">
                  Each participant trains with their own trainer (
                  {computeBookingAmount(
                    selectedPackage,
                    contact.numParticipants,
                  ).toLocaleString("en-US")}{" "}
                  THB total per session).
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Camp */}
      {step === 1 && (
        <div className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Choose Your Camp
          </h2>
          {CAMPS.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setCamp(c.id)}
              className={`w-full text-left rounded-[var(--radius-card)] p-4 sm:p-5 border-2 transition-all ${
                camp === c.id
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant bg-surface-lowest hover:border-outline"
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin
                  size={20}
                  className={
                    camp === c.id ? "text-primary" : "text-on-surface-variant"
                  }
                  aria-hidden="true"
                />
                <div>
                  <span className="font-serif text-base font-semibold text-on-surface">
                    {c.name}
                  </span>
                  <p className="text-on-surface-variant text-sm">
                    {c.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Date + Time */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Pick a Date and Time
          </h2>
          <AvailabilityCalendar
            type="private"
            selected={date}
            onSelect={setDate}
            onAvailableSlotsChange={setAvailableSlots}
            camp={camp ?? undefined}
            unitsRequested={units}
          />
          {date && (() => {
            const dateStr = format(date, "yyyy-MM-dd");
            const slotStates = PRIVATE_SLOTS.map((slot) => {
              const withinCutoff = isSlotWithinCutoff(date, slot);
              const cutoffHours = getCutoffHoursForSlot(slot);
              const inCart = sessions.some(
                (s) => s.date === dateStr && s.slot === slot,
              );
              const isAvailable =
                availableSlots.includes(slot) && !withinCutoff && !inCart;
              return { slot, isAvailable, withinCutoff, cutoffHours, inCart };
            });
            const anyCutoffBlocked = slotStates.some((s) => s.withinCutoff);
            const waMessage = `Hi, I would like to book a private session on ${formatDateLong(
              date,
            )} but my preferred time slot is not available online. Can you help?`;
            return (
              <div>
                <p className="text-sm font-medium text-on-surface mb-3">
                  Available time slots
                </p>
                <div className="space-y-4">
                  {SLOT_GROUPS.map((group) => {
                    const groupStates = slotStates.filter((s) =>
                      (group.slots as readonly string[]).includes(s.slot),
                    );
                    if (groupStates.length === 0) return null;
                    return (
                      <div key={group.label}>
                        <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">
                          {group.label}
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {groupStates.map(({ slot, isAvailable, withinCutoff, cutoffHours, inCart }) => (
                            <button
                              type="button"
                              key={slot}
                              disabled={!isAvailable}
                              onClick={() =>
                                setSessions((prev) =>
                                  prev.length >= maxSessions
                                    ? prev
                                    : [...prev, { date: dateStr, slot }],
                                )
                              }
                              aria-label={
                                inCart
                                  ? `${slot}, added to your sessions`
                                  : withinCutoff
                                    ? `${slot}, less than ${cutoffHours} hours away, book by WhatsApp`
                                    : slot
                              }
                              className={`rounded-[var(--radius-input)] py-3 text-sm font-semibold border-2 transition-colors ${
                                inCart
                                  ? "border-primary bg-primary text-white"
                                  : isAvailable
                                    ? "border-outline-variant bg-surface-lowest text-on-surface hover:border-outline"
                                    : "border-outline-variant bg-surface-lowest text-on-surface-variant/30 line-through cursor-not-allowed"
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {sessions.length > 0 && (
                  <div className="mt-4 rounded-[var(--radius-card)] border-2 border-outline-variant bg-surface-lowest p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
                      Your sessions ({sessions.length}
                      {isPack ? "" : ` / ${maxSessions}`})
                    </p>
                    <ul className="space-y-2">
                      {sortedSessions().map((s) => (
                        <li
                          key={`${s.date}-${s.slot}`}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="text-on-surface">
                            {formatDateLong(new Date(`${s.date}T00:00:00`))} at{" "}
                            {s.slot}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setSessions((prev) =>
                                prev.filter(
                                  (x) =>
                                    !(x.date === s.date && x.slot === s.slot),
                                ),
                              )
                            }
                            className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
                            aria-label={`Remove session on ${s.date} at ${s.slot}`}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                    {!isPack && sessions.length < maxSessions && (
                      <p className="text-xs text-on-surface-variant mt-3">
                        Pick another date or time to add more sessions. One
                        payment for everything.
                      </p>
                    )}
                  </div>
                )}
                {isPack && (
                  <p className="mt-4 text-xs text-on-surface-variant">
                    Your pack includes 10 sessions. Book your first one here;
                    the other nine are scheduled at the camp or on WhatsApp.
                  </p>
                )}
                <div className="mt-4 flex items-start gap-3 rounded-[var(--radius-card)] border-2 border-primary/30 bg-primary/5 p-4">
                  <MessageCircle
                    size={20}
                    className="text-primary shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-on-surface mb-1">
                      If your preferred time slot is not available, please
                      leave us a message.
                    </p>
                    {anyCutoffBlocked && (
                      <p className="text-on-surface-variant mb-2">
                        {PRIVATE_BOOKING_WHATSAPP_FALLBACK}
                      </p>
                    )}
                    <a
                      href={buildWhatsAppUrl(waMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-dim font-semibold inline-flex items-center gap-1"
                    >
                      Message us on WhatsApp
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Step 3: Contact */}
      {step === 3 && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Your Details
          </h2>
          <ContactInfoForm
            value={contact}
            onChange={setContact}
            showParticipants={false}
          />
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && selectedPackage && camp && sessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Confirm & Pay
          </h2>
          <BookingReview
            rows={[
              { label: "Session type", value: selectedPackage.name },
              {
                label: "Camp",
                value: CAMPS.find((c) => c.id === camp)!.name,
              },
              ...sortedSessions().map((s, i) => ({
                label: sessions.length > 1 ? `Session ${i + 1}` : "Session",
                value: `${formatDateLong(new Date(`${s.date}T00:00:00`))} at ${s.slot}`,
              })),
              ...(bounds.max > 1
                ? [
                    {
                      label: "Participants",
                      value: `${contact.numParticipants}`,
                    },
                  ]
                : []),
              { label: "Contact", value: contact.email },
            ]}
            totalAmount={totalAmount}
            note={
              bounds.max > 1 && contact.numParticipants > 1
                ? selectedPackage.billing === "flat"
                  ? "One price per session, no matter how many people join."
                  : "Price per person."
                : undefined
            }
          />
          <p className="text-xs text-on-surface-variant border-l-2 border-primary/40 pl-3">
            {PRIVATE_CANCELLATION_POLICY}
          </p>
          <TurnstileWidget
            onVerify={captcha.onVerify}
            onExpire={captcha.onExpire}
            action="booking-private"
          />
          {error && (
            <div className="bg-primary/10 border-2 border-primary/30 rounded-[var(--radius-card)] p-4">
              <p className="text-on-surface text-sm">{error}</p>
            </div>
          )}
        </div>
      )}
    </BookingWizard>
  );
}
