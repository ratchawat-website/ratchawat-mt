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
import { MapPin } from "lucide-react";
import { getPricesByBookingType, getPriceById } from "@/content/pricing";
import { PRIVATE_SLOTS } from "@/lib/config/slots";
import { formatDateLong } from "@/lib/utils/date-format";

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

function isGroupPrice(id: string): boolean {
  return id === "private-adult-group" || id === "private-kids-group";
}

export default function PrivateWizard() {
  const searchParams = useSearchParams();
  const packages = PRIVATE_PACKAGES;

  const [step, setStep] = useState(0);
  const [priceId, setPriceId] = useState<string | null>(null);
  const [camp, setCamp] = useState<"bo-phut" | "plai-laem" | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [timeSlot, setTimeSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([...PRIVATE_SLOTS]);
  const [contact, setContact] = useState<ContactInfo>(DEFAULT_CONTACT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const isGroup = priceId ? isGroupPrice(priceId) : false;

  // Reset num_participants to 1 when switching from group to solo
  useEffect(() => {
    if (!isGroup && contact.numParticipants !== 1) {
      setContact((c) => ({ ...c, numParticipants: 1 }));
    }
    if (isGroup && contact.numParticipants < 2) {
      setContact((c) => ({ ...c, numParticipants: 2 }));
    }
  }, [isGroup, contact.numParticipants]);

  const totalAmount =
    selectedPackage && selectedPackage.price
      ? selectedPackage.price * contact.numParticipants
      : 0;

  const canProceed = () => {
    if (step === 0) return !!priceId;
    if (step === 1) return !!camp;
    if (step === 2) return !!date && !!timeSlot;
    if (step === 3) return isContactInfoValid(contact);
    if (step === 4) return isContactInfoValid(contact);
    return false;
  };

  const handleSubmit = async () => {
    if (!selectedPackage || !camp || !date || !timeSlot) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_id: selectedPackage.id,
          type: "private",
          camp,
          start_date: date.toISOString().split("T")[0],
          time_slot: timeSlot,
          num_participants: contact.numParticipants,
          client_name: contact.name,
          client_email: contact.email,
          client_phone: contact.phone,
          client_nationality: contact.nationality || undefined,
          notes: contact.notes || undefined,
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
            onSelect={(d) => {
              setDate(d);
              setTimeSlot(null);
            }}
            onAvailableSlotsChange={setAvailableSlots}
          />
          {date && (
            <div>
              <p className="text-sm font-medium text-on-surface mb-3">
                Available time slots
              </p>
              <div className="grid grid-cols-4 gap-2">
                {PRIVATE_SLOTS.map((slot) => {
                  const isAvailable = availableSlots.includes(slot);
                  return (
                    <button
                      type="button"
                      key={slot}
                      disabled={!isAvailable}
                      onClick={() => setTimeSlot(slot)}
                      className={`rounded-[var(--radius-input)] py-3 text-sm font-semibold border-2 transition-colors ${
                        timeSlot === slot
                          ? "border-primary bg-primary text-white"
                          : isAvailable
                            ? "border-outline-variant bg-surface-lowest text-on-surface hover:border-outline"
                            : "border-outline-variant bg-surface-lowest text-on-surface-variant/30 line-through cursor-not-allowed"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
            showParticipants={isGroup}
            maxParticipants={3}
          />
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && selectedPackage && camp && date && timeSlot && (
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
              {
                label: "Date",
                value: formatDateLong(date),
              },
              { label: "Time", value: timeSlot },
              ...(isGroup
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
            note={isGroup ? "Price per person for group sessions." : undefined}
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
