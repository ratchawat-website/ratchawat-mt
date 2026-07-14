"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";
import BookingWizard from "@/components/booking/BookingWizard";
import StayCalendar from "@/components/booking/StayCalendar";
import ContactInfoForm, {
  ContactInfo,
  isContactInfoValid,
} from "@/components/booking/ContactInfoForm";
import BookingReview from "@/components/booking/BookingReview";
import { getRateCard, type StayUnit } from "@/content/stay-pricing";
import { computeStayPrice } from "@/lib/booking/stay";
import { getStayUnitInventoryKey } from "@/lib/admin/inventory";
import { formatDateLong } from "@/lib/utils/date-format";
import { format } from "date-fns";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { useTurnstile } from "@/components/security/use-turnstile";
import { ROOM_RESERVATION_POLICY } from "@/content/policies";

const STEPS = ["Accommodation", "Dates", "Contact", "Review"];

const DEFAULT_CONTACT: ContactInfo = {
  name: "",
  email: "",
  phone: "",
  nationality: "",
  numParticipants: 1,
  notes: "",
};

const UNIT_CARDS: { unit: StayUnit }[] = [{ unit: "room" }, { unit: "bungalow" }];

export default function CampStayWizard() {
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [unit, setUnit] = useState<StayUnit | null>(null);
  const [range, setRange] = useState<DateRange | undefined>();
  const [contact, setContact] = useState<ContactInfo>(DEFAULT_CONTACT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const captcha = useTurnstile();
  const plan = "normal" as const;

  // Consume `?package=` on mount only. Legacy package ids from old links map
  // to a unit; dates are now always chosen freely.
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const pkg = searchParams.get("package");
    if (pkg) {
      setUnit(pkg.includes("bungalow") ? "bungalow" : "room");
      setStep(1);
    }
  }, [searchParams]);

  const quote = useMemo(() => {
    if (!unit || !range?.from || !range?.to) return null;
    try {
      return computeStayPrice(
        format(range.from, "yyyy-MM-dd"),
        format(range.to, "yyyy-MM-dd"),
        unit,
        plan,
      );
    } catch {
      return null;
    }
  }, [unit, range, plan]);

  const canProceed = () => {
    if (step === 0) return !!unit;
    if (step === 1) return !!quote;
    if (step === 2) return isContactInfoValid(contact);
    if (step === 3) return isContactInfoValid(contact) && captcha.ready;
    return false;
  };

  const handleSubmit = async () => {
    if (!unit || !quote || !range?.from || !range?.to) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/stay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unit,
          plan,
          check_in: format(range.from, "yyyy-MM-dd"),
          check_out: format(range.to, "yyyy-MM-dd"),
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
      isFinalStep={step === 3}
      isSubmitting={isSubmitting}
      submitLabel={
        quote ? `Pay ${quote.total.toLocaleString("en-US")} THB` : "Pay"
      }
      onSubmit={handleSubmit}
    >
      {/* Step 0: Accommodation */}
      {step === 0 && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Select Your Accommodation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {UNIT_CARDS.map(({ unit: u }) => {
              const card = getRateCard(u, plan)!;
              const baseTier = card.tiers[0];
              const topTier = card.tiers[card.tiers.length - 1];
              return (
                <button
                  type="button"
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`text-left rounded-[var(--radius-card)] p-4 sm:p-5 border-2 transition-all ${
                    unit === u
                      ? "border-primary bg-primary/5"
                      : "border-outline-variant bg-surface-lowest hover:border-outline"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-serif text-base font-semibold text-on-surface">
                      {card.label}
                    </span>
                    {u === "bungalow" && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded">
                        Unique - 1 on-site
                      </span>
                    )}
                  </div>
                  <p className="font-serif text-xl font-bold text-primary mb-1">
                    From {baseTier.basePrice.toLocaleString("en-US")} THB /{" "}
                    {baseTier.nights} nights
                  </p>
                  <p className="text-on-surface-variant text-xs mb-2">
                    +{topTier.extraNightRate.toLocaleString("en-US")} THB per
                    extra night
                  </p>
                  <ul className="text-on-surface-variant text-xs leading-relaxed space-y-0.5">
                    {card.copyNotes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                  <p className="text-on-surface-variant text-[10px] mt-2 uppercase tracking-wider">
                    Stay Plai Laem, train either camp
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 1: Dates */}
      {step === 1 && unit && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Pick Your Check-in and Check-out Dates
          </h2>
          <StayCalendar
            inventoryKey={getStayUnitInventoryKey(unit)}
            range={range}
            onRangeChange={setRange}
            minNights={getRateCard(unit, plan)!.minNights}
          />
          {quote && (
            <div className="bg-primary/5 border-2 border-primary/20 rounded-[var(--radius-card)] p-4 space-y-1 text-sm">
              <p className="text-on-surface">
                <span className="text-on-surface-variant">Stay:</span>{" "}
                <strong>{quote.nights} nights</strong> (
                {formatDateLong(range!.from!)} to {formatDateLong(range!.to!)})
              </p>
              <p className="text-on-surface">
                <span className="text-on-surface-variant">Base:</span>{" "}
                {quote.basePrice.toLocaleString("en-US")} THB for{" "}
                {quote.tierNights} nights
              </p>
              {quote.extraNights > 0 && (
                <p className="text-on-surface">
                  <span className="text-on-surface-variant">Extra nights:</span>{" "}
                  {quote.extraNights} x{" "}
                  {quote.extraNightRate.toLocaleString("en-US")} THB
                </p>
              )}
              <p className="font-serif text-lg font-bold text-primary pt-1">
                Total: {quote.total.toLocaleString("en-US")} THB
              </p>
              <ul className="text-xs text-on-surface-variant pt-2 space-y-0.5">
                {quote.copyNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
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
      {step === 3 && quote && range?.from && range?.to && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Confirm & Pay
          </h2>
          <BookingReview
            rows={[
              { label: "Accommodation", value: quote.label },
              { label: "Check-in", value: formatDateLong(range.from) },
              { label: "Check-out", value: formatDateLong(range.to) },
              { label: "Nights", value: String(quote.nights) },
              {
                label: "Access",
                value: "Stay Plai Laem, train any camp",
              },
              { label: "Contact", value: contact.email },
            ]}
            totalAmount={quote.total}
          />
          <p className="text-xs text-on-surface-variant border-l-2 border-primary/40 pl-3">
            {ROOM_RESERVATION_POLICY}
          </p>
          <TurnstileWidget
            onVerify={captcha.onVerify}
            onExpire={captcha.onExpire}
            action="booking-camp-stay"
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
