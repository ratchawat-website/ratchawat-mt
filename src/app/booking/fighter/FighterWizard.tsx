"use client";

import { useState, useEffect, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import BookingWizard from "@/components/booking/BookingWizard";
import DatePicker from "@/components/booking/DatePicker";
import StayCalendar from "@/components/booking/StayCalendar";
import ContactInfoForm, {
  ContactInfo,
  isContactInfoValid,
} from "@/components/booking/ContactInfoForm";
import BookingReview from "@/components/booking/BookingReview";
import GlassCard from "@/components/ui/GlassCard";
import { MapPin, Swords, Brain, Shield, Zap } from "lucide-react";
import { getPriceById } from "@/content/pricing";
import { getRateCard } from "@/content/stay-pricing";
import { computeStayPrice } from "@/lib/booking/stay";
import { getStayUnitInventoryKey } from "@/lib/admin/inventory";
import { formatDateLong } from "@/lib/utils/date-format";
import { format } from "date-fns";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import { useTurnstile } from "@/components/security/use-turnstile";
import { ROOM_RESERVATION_POLICY } from "@/content/policies";

const STEPS = ["Info", "Tier", "Camp & Date", "Contact", "Review"];

const CAMPS = [
  {
    id: "plai-laem" as const,
    name: "Plai Laem",
    description: "Plai Laem Soi 13, near Big Buddha. Fighter program runs here only.",
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

type FighterTier = "only" | "room" | "bungalow";

export default function FighterWizard() {
  const fighterOnly = getPriceById("fighter-monthly")!;
  const stayTiers = [
    { unit: "room" as const, card: getRateCard("room", "fighter")! },
    { unit: "bungalow" as const, card: getRateCard("bungalow", "fighter")! },
  ];

  const [step, setStep] = useState(0);
  const [tier, setTier] = useState<FighterTier | null>(null);
  const [camp, setCamp] = useState<"plai-laem" | null>("plai-laem");
  const [date, setDate] = useState<Date | undefined>();
  const [range, setRange] = useState<DateRange | undefined>();
  const [contact, setContact] = useState<ContactInfo>(DEFAULT_CONTACT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const captcha = useTurnstile();

  // Fighter program runs at Plai Laem only — camp stays locked to plai-laem.
  useEffect(() => {
    setCamp("plai-laem");
  }, [tier]);

  const hasStay = tier === "room" || tier === "bungalow";

  const quote = useMemo(() => {
    if (tier !== "room" && tier !== "bungalow") return null;
    if (!range?.from || !range?.to) return null;
    try {
      return computeStayPrice(
        format(range.from, "yyyy-MM-dd"),
        format(range.to, "yyyy-MM-dd"),
        tier,
        "fighter",
      );
    } catch {
      return null;
    }
  }, [tier, range]);

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return !!tier;
    if (step === 2) return hasStay ? !!quote : !!camp && !!date;
    if (step === 3) return isContactInfoValid(contact);
    if (step === 4) return isContactInfoValid(contact) && captcha.ready;
    return false;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      let res: Response;
      if ((tier === "room" || tier === "bungalow") && range?.from && range?.to) {
        res = await fetch("/api/checkout/stay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unit: tier,
            plan: "fighter",
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
      } else if (tier === "only" && camp && date) {
        res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            price_id: fighterOnly.id,
            type: "fighter",
            camp,
            start_date: format(date, "yyyy-MM-dd"),
            num_participants: 1,
            client_name: contact.name,
            client_email: contact.email,
            client_phone: contact.phone,
            client_nationality: contact.nationality || undefined,
            notes: contact.notes || undefined,
            cf_turnstile_token: captcha.token,
          }),
        });
      } else {
        return;
      }
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

  const submitLabel = hasStay
    ? quote
      ? `Pay ${quote.total.toLocaleString("en-US")} THB`
      : "Pay"
    : fighterOnly.price
      ? `Pay ${fighterOnly.price.toLocaleString("en-US")} THB`
      : "Pay";

  return (
    <BookingWizard
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      canProceed={canProceed()}
      isFinalStep={step === 4}
      isSubmitting={isSubmitting}
      submitLabel={submitLabel}
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
          <button
            type="button"
            onClick={() => setTier("only")}
            className={`w-full text-left rounded-[var(--radius-card)] p-4 sm:p-5 border-2 transition-all ${
              tier === "only"
                ? "border-primary bg-primary/5"
                : "border-outline-variant bg-surface-lowest hover:border-outline"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-serif text-base font-semibold text-on-surface">
                    {fighterOnly.name}
                  </span>
                </div>
                <p className="text-on-surface-variant text-sm">
                  {fighterOnly.description}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-serif text-lg font-bold text-primary">
                  {fighterOnly.price?.toLocaleString("en-US")} THB
                </span>
                <p className="text-on-surface-variant text-xs">
                  / {fighterOnly.unit}
                </p>
              </div>
            </div>
          </button>
          {stayTiers.map(({ unit, card }) => {
            const baseTier = card.tiers[0];
            return (
              <button
                type="button"
                key={unit}
                onClick={() => setTier(unit)}
                className={`w-full text-left rounded-[var(--radius-card)] p-4 sm:p-5 border-2 transition-all ${
                  tier === unit
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant bg-surface-lowest hover:border-outline"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-serif text-base font-semibold text-on-surface">
                        {card.label}
                      </span>
                      {unit === "bungalow" && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded">
                          Unique - 1 on-site
                        </span>
                      )}
                    </div>
                    <ul className="text-on-surface-variant text-sm space-y-0.5">
                      {card.copyNotes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-serif text-lg font-bold text-primary">
                      From {baseTier.basePrice.toLocaleString("en-US")} THB
                    </span>
                    <p className="text-on-surface-variant text-xs">
                      / {baseTier.nights} nights
                    </p>
                    <p className="text-on-surface-variant text-xs">
                      +{baseTier.extraNightRate.toLocaleString("en-US")} THB per
                      extra night
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 2: Camp + Date */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Camp and {hasStay ? "Dates" : "Start Date"}
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
                    Plai Laem only
                  </p>
                  <p className="text-on-surface-variant text-sm mt-1">
                    The fighter program runs at our Plai Laem camp only, where
                    you also stay on-site. Two sessions a day, six days a week.
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
              {hasStay ? "Check-in and check-out dates" : "Start date"}
            </p>
            {tier === "room" || tier === "bungalow" ? (
              <div className="space-y-4">
                <StayCalendar
                  inventoryKey={getStayUnitInventoryKey(tier)}
                  range={range}
                  onRangeChange={setRange}
                  minNights={30}
                />
                {quote && (
                  <div className="bg-primary/5 border-2 border-primary/20 rounded-[var(--radius-card)] p-4 space-y-1 text-sm">
                    <p className="text-on-surface">
                      <span className="text-on-surface-variant">Stay:</span>{" "}
                      <strong>{quote.nights} nights</strong> (
                      {formatDateLong(range!.from!)} to{" "}
                      {formatDateLong(range!.to!)})
                    </p>
                    <p className="text-on-surface">
                      <span className="text-on-surface-variant">Base:</span>{" "}
                      {quote.basePrice.toLocaleString("en-US")} THB for{" "}
                      {quote.tierNights} nights
                    </p>
                    {quote.extraNights > 0 && (
                      <p className="text-on-surface">
                        <span className="text-on-surface-variant">
                          Extra nights:
                        </span>{" "}
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
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Confirm & Pay
          </h2>
          {hasStay && quote && range?.from && range?.to ? (
            <BookingReview
              rows={[
                { label: "Tier", value: quote.label },
                { label: "Check-in", value: formatDateLong(range.from) },
                { label: "Check-out", value: formatDateLong(range.to) },
                { label: "Nights", value: String(quote.nights) },
                { label: "Contact", value: contact.email },
              ]}
              totalAmount={quote.total}
            />
          ) : (
            camp &&
            date && (
              <BookingReview
                rows={[
                  { label: "Tier", value: fighterOnly.name },
                  {
                    label: "Camp",
                    value: CAMPS.find((c) => c.id === camp)?.name ?? camp,
                  },
                  { label: "Start date", value: formatDateLong(date) },
                  { label: "Contact", value: contact.email },
                ]}
                totalAmount={fighterOnly.price ?? 0}
              />
            )
          )}
          {hasStay && (
            <p className="text-xs text-on-surface-variant border-l-2 border-primary/40 pl-3">
              {ROOM_RESERVATION_POLICY}
            </p>
          )}
          <TurnstileWidget
            onVerify={captcha.onVerify}
            onExpire={captcha.onExpire}
            action="booking-fighter"
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
