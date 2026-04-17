"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import BookingWizard from "@/components/booking/BookingWizard";
import DatePicker from "@/components/booking/DatePicker";
import ContactInfoForm, {
  ContactInfo,
  isContactInfoValid,
} from "@/components/booking/ContactInfoForm";
import BookingReview from "@/components/booking/BookingReview";
import { MapPin } from "lucide-react";
import { getPricesByBookingType, getPriceById } from "@/content/pricing";
import { format } from "date-fns";

const STEPS = ["Package", "Camp", "Date", "Contact", "Review"];

// Computed once at module load; filter is stable since pricing.ts is static.
const TRAINING_PACKAGES = getPricesByBookingType("training").filter(
  (p) => !p.id.startsWith("bodyweight-"),
);

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

export default function TrainingWizard() {
  const searchParams = useSearchParams();
  const packages = TRAINING_PACKAGES;

  const [step, setStep] = useState(0);
  const [priceId, setPriceId] = useState<string | null>(null);
  const [camp, setCamp] = useState<"bo-phut" | "plai-laem" | null>(null);
  const [date, setDate] = useState<Date | undefined>();
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
    if (pkg && TRAINING_PACKAGES.some((p) => p.id === pkg)) {
      setPriceId(pkg);
      setStep(1);
    }
  }, [searchParams]);

  const selectedPackage = priceId ? getPriceById(priceId) : null;

  const canProceed = () => {
    if (step === 0) return !!priceId;
    if (step === 1) return !!camp;
    if (step === 2) return !!date;
    if (step === 3) return isContactInfoValid(contact);
    if (step === 4) return isContactInfoValid(contact);
    return false;
  };

  const handleSubmit = async () => {
    if (!selectedPackage || !camp || !date) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_id: selectedPackage.id,
          type: "training",
          camp,
          start_date: format(date, "yyyy-MM-dd"),
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

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);

  return (
    <BookingWizard
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      canProceed={canProceed()}
      isFinalStep={step === 4}
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
        <div className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Select a Package
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif text-base font-semibold text-on-surface">
                      {pkg.name}
                    </span>
                    {pkg.popular && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded">
                        Popular
                      </span>
                    )}
                  </div>
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

      {/* Step 2: Date */}
      {step === 2 && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Pick a Start Date
          </h2>
          <DatePicker
            selected={date}
            onSelect={setDate}
            minDate={tomorrow}
            maxDate={maxDate}
            weekdaysDisabled={[0]}
          />
          <p className="text-on-surface-variant text-xs mt-3">
            Sundays are rest days. Classes run Monday through Saturday.
          </p>
        </div>
      )}

      {/* Step 3: Contact */}
      {step === 3 && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Your Details
          </h2>
          <ContactInfoForm value={contact} onChange={setContact} />
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && selectedPackage && camp && date && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Confirm & Pay
          </h2>
          <BookingReview
            rows={[
              { label: "Package", value: selectedPackage.name },
              {
                label: "Camp",
                value: CAMPS.find((c) => c.id === camp)!.name,
              },
              {
                label: "Start date",
                value: date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
              },
              { label: "Contact", value: contact.email },
            ]}
            totalAmount={selectedPackage.price ?? 0}
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
