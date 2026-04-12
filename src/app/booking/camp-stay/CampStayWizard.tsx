"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import BookingWizard from "@/components/booking/BookingWizard";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";
import type { InventoryKey } from "@/lib/admin/inventory";
import ContactInfoForm, {
  ContactInfo,
  isContactInfoValid,
} from "@/components/booking/ContactInfoForm";
import BookingReview from "@/components/booking/BookingReview";
import { getPricesByBookingType, getPriceById } from "@/content/pricing";

const STEPS = ["Package", "Check-in", "Contact", "Review"];

// Computed once at module load; reference stays stable across re-renders.
const CAMP_STAY_PACKAGES = getPricesByBookingType("camp-stay");

const DEFAULT_CONTACT: ContactInfo = {
  name: "",
  email: "",
  phone: "",
  nationality: "",
  numParticipants: 1,
  notes: "",
};

function getDurationDays(id: string): number {
  if (id === "camp-stay-1week") return 7;
  if (id === "camp-stay-2weeks") return 14;
  if (id === "camp-stay-1month") return 30;
  if (id === "camp-stay-bungalow-monthly") return 30;
  return 7;
}

function getStayDuration(priceId: string | null): number {
  if (!priceId) return 7;
  if (priceId.includes("1week")) return 7;
  if (priceId.includes("2weeks")) return 14;
  if (priceId.includes("1month") || priceId.includes("monthly")) return 30;
  return 7;
}

function getInventoryKeyForPackage(priceId: string | null): InventoryKey {
  if (priceId && priceId.includes("bungalow")) return "bungalows";
  return "rooms";
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function CampStayWizard() {
  const searchParams = useSearchParams();
  const packages = CAMP_STAY_PACKAGES;

  const [step, setStep] = useState(0);
  const [priceId, setPriceId] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<Date | undefined>();
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
    if (pkg && CAMP_STAY_PACKAGES.some((p) => p.id === pkg)) {
      setPriceId(pkg);
      setStep(1);
    }
  }, [searchParams]);

  const selectedPackage = priceId ? getPriceById(priceId) : null;

  const checkOut =
    checkIn && priceId
      ? new Date(checkIn.getTime() + getDurationDays(priceId) * 86400000)
      : null;

  const canProceed = () => {
    if (step === 0) return !!priceId;
    if (step === 1) return !!checkIn;
    if (step === 2) return isContactInfoValid(contact);
    if (step === 3) return isContactInfoValid(contact);
    return false;
  };

  const handleSubmit = async () => {
    if (!selectedPackage || !checkIn || !checkOut) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_id: selectedPackage.id,
          type: "camp-stay",
          camp: "both",
          start_date: checkIn.toISOString().split("T")[0],
          end_date: checkOut.toISOString().split("T")[0],
          num_participants: 1,
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
      isFinalStep={step === 3}
      isSubmitting={isSubmitting}
      submitLabel={
        selectedPackage && selectedPackage.price
          ? `Pay ${selectedPackage.price.toLocaleString("en-US")} THB`
          : "Pay"
      }
      onSubmit={handleSubmit}
    >
      {/* Step 0: Package */}
      {step === 0 && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Select Your Package
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {packages.map((pkg) => (
              <button
                type="button"
                key={pkg.id}
                onClick={() => setPriceId(pkg.id)}
                className={`text-left rounded-[var(--radius-card)] p-4 sm:p-5 border-2 transition-all ${
                  priceId === pkg.id
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant bg-surface-lowest hover:border-outline"
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="font-serif text-base font-semibold text-on-surface">
                    {pkg.nameShort}
                  </span>
                  {pkg.popular && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded">
                      Popular
                    </span>
                  )}
                  {pkg.id === "camp-stay-bungalow-monthly" && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded">
                      Unique - 1 on-site
                    </span>
                  )}
                </div>
                <p className="font-serif text-xl font-bold text-primary mb-2">
                  {pkg.price?.toLocaleString("en-US")} THB
                </p>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  {pkg.description}
                </p>
                <p className="text-on-surface-variant text-[10px] mt-2 uppercase tracking-wider">
                  Stay Plai Laem, train either camp
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Check-in */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Pick Your Check-in Date
          </h2>
          <AvailabilityCalendar
            type="camp-stay"
            selected={checkIn}
            onSelect={setCheckIn}
            inventoryKey={getInventoryKeyForPackage(priceId)}
            stayDurationDays={getStayDuration(priceId)}
          />
          {checkIn && checkOut && (
            <div className="bg-primary/5 border-2 border-primary/20 rounded-[var(--radius-card)] p-4">
              <p className="text-on-surface text-sm">
                <span className="text-on-surface-variant">Check-in:</span>{" "}
                <strong>{formatDate(checkIn)}</strong>
              </p>
              <p className="text-on-surface text-sm mt-1">
                <span className="text-on-surface-variant">Check-out:</span>{" "}
                <strong>{formatDate(checkOut)}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Contact */}
      {step === 2 && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Your Details
          </h2>
          <ContactInfoForm value={contact} onChange={setContact} />
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && selectedPackage && checkIn && checkOut && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Confirm & Pay
          </h2>
          <BookingReview
            rows={[
              { label: "Package", value: selectedPackage.name },
              { label: "Check-in", value: formatDate(checkIn) },
              { label: "Check-out", value: formatDate(checkOut) },
              {
                label: "Access",
                value: "Stay Plai Laem, train any camp",
              },
              { label: "Contact", value: contact.email },
            ]}
            totalAmount={selectedPackage.price ?? 0}
            note={selectedPackage.notes ?? undefined}
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
