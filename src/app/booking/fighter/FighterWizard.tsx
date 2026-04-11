"use client";

import { useState, useEffect } from "react";
import BookingWizard from "@/components/booking/BookingWizard";
import DatePicker from "@/components/booking/DatePicker";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";
import ContactInfoForm, {
  ContactInfo,
  isContactInfoValid,
} from "@/components/booking/ContactInfoForm";
import BookingReview from "@/components/booking/BookingReview";
import GlassCard from "@/components/ui/GlassCard";
import { MapPin, Swords, Brain, Shield, Zap, Info } from "lucide-react";
import { getPricesByBookingType, getPriceById } from "@/content/pricing";

const STEPS = ["Info", "Tier", "Camp & Date", "Contact", "Review"];

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

function isStayTier(id: string | null): boolean {
  return (
    id === "fighter-stay-room-monthly" || id === "fighter-stay-bungalow-monthly"
  );
}

export default function FighterWizard() {
  const tiers = getPricesByBookingType("fighter");

  const [step, setStep] = useState(0);
  const [priceId, setPriceId] = useState<string | null>(null);
  const [camp, setCamp] = useState<"bo-phut" | "plai-laem" | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [contact, setContact] = useState<ContactInfo>(DEFAULT_CONTACT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-lock Plai Laem when a stay tier is picked
  useEffect(() => {
    if (isStayTier(priceId)) {
      setCamp("plai-laem");
    }
  }, [priceId]);

  const selectedTier = priceId ? getPriceById(priceId) : null;
  const hasStay = isStayTier(priceId);

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return !!priceId;
    if (step === 2) return !!camp && !!date;
    if (step === 3) return isContactInfoValid(contact);
    if (step === 4) return isContactInfoValid(contact);
    return false;
  };

  const handleSubmit = async () => {
    if (!selectedTier || !camp || !date) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_id: selectedTier.id,
          type: "fighter",
          camp,
          start_date: date.toISOString().split("T")[0],
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
  maxDate.setDate(maxDate.getDate() + 120);

  return (
    <BookingWizard
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      canProceed={canProceed()}
      isFinalStep={step === 4}
      isSubmitting={isSubmitting}
      submitLabel={
        selectedTier && selectedTier.price
          ? `Pay ${selectedTier.price.toLocaleString()} THB`
          : "Pay"
      }
      onSubmit={handleSubmit}
    >
      {/* Step 0: Info */}
      {step === 0 && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            What You Get
          </h2>
          <GlassCard hover={false}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Swords size={20} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-on-surface font-medium text-sm">Two sessions per day</p>
                  <p className="text-on-surface-variant text-xs">Morning technique and pad work, afternoon sparring and clinch.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap size={20} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-on-surface font-medium text-sm">Weekly conditioning</p>
                  <p className="text-on-surface-variant text-xs">Stretch and yoga class. Weekly ice bath for recovery.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={20} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-on-surface font-medium text-sm">Fight organization</p>
                  <p className="text-on-surface-variant text-xs">Trainers match you with an opponent and handle booking.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Brain size={20} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-on-surface font-medium text-sm">Corner support on fight day</p>
                  <p className="text-on-surface-variant text-xs">Coaching, wraps, warm-up, and corner during your bout.</p>
                </div>
              </div>
            </div>
          </GlassCard>
          <p className="text-on-surface-variant text-xs mt-4">
            This is not a beginner program. You should have at least 6 months of Muay Thai or similar striking experience.
          </p>
        </div>
      )}

      {/* Step 1: Tier */}
      {step === 1 && (
        <div className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Choose Your Tier
          </h2>
          {tiers.map((tier) => (
            <button
              type="button"
              key={tier.id}
              onClick={() => setPriceId(tier.id)}
              className={`w-full text-left rounded-[var(--radius-card)] p-4 sm:p-5 border-2 transition-all ${
                priceId === tier.id
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant bg-surface-lowest hover:border-outline"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-serif text-base font-semibold text-on-surface">
                      {tier.name}
                    </span>
                    {tier.priceTodo && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-on-surface-variant/20 text-on-surface-variant px-2 py-0.5 rounded">
                        Approximate
                      </span>
                    )}
                    {tier.id === "fighter-stay-bungalow-monthly" && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded">
                        Unique - 1 on-site
                      </span>
                    )}
                  </div>
                  <p className="text-on-surface-variant text-sm">
                    {tier.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-serif text-lg font-bold text-primary">
                    {tier.price?.toLocaleString()} THB
                  </span>
                  <p className="text-on-surface-variant text-xs">
                    / {tier.unit}
                  </p>
                </div>
              </div>
            </button>
          ))}
          {selectedTier?.priceTodo && (
            <div className="flex items-start gap-2 mt-4 text-xs text-on-surface-variant">
              <Info size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
              <p>
                This is an approximate price. The gym will confirm the final
                amount before your booking is locked in. You can contact us on
                WhatsApp if you need clarification.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Camp + Date */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Camp and Start Date
          </h2>

          {hasStay ? (
            <GlassCard hover={false}>
              <div className="flex items-start gap-3">
                <MapPin
                  size={24}
                  className="text-primary shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-serif text-base font-semibold text-on-surface">
                    Plai Laem - Accommodation included
                  </p>
                  <p className="text-on-surface-variant text-sm mt-1">
                    You stay at Plai Laem camp on-site. Training access at
                    both Plai Laem and Bo Phut is included in the fighter
                    program.
                  </p>
                </div>
              </div>
            </GlassCard>
          ) : (
            <div className="space-y-3">
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
                        camp === c.id
                          ? "text-primary"
                          : "text-on-surface-variant"
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

          <div>
            <p className="text-sm font-medium text-on-surface mb-3">
              {hasStay ? "Check-in date" : "Start date"}
            </p>
            {hasStay ? (
              <AvailabilityCalendar
                type="camp-stay"
                selected={date}
                onSelect={setDate}
              />
            ) : (
              <DatePicker
                selected={date}
                onSelect={setDate}
                minDate={tomorrow}
                maxDate={maxDate}
                weekdaysDisabled={[0]}
              />
            )}
          </div>
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
      {step === 4 && selectedTier && camp && date && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Confirm & Pay
          </h2>
          <BookingReview
            rows={[
              { label: "Tier", value: selectedTier.name },
              {
                label: "Camp",
                value:
                  camp === "plai-laem" && hasStay
                    ? "Plai Laem (with accommodation)"
                    : CAMPS.find((c) => c.id === camp)?.name ?? camp,
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
            totalAmount={selectedTier.price ?? 0}
            note={
              selectedTier.priceTodo
                ? "This price is approximate. The gym will confirm the final amount after you book."
                : undefined
            }
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
