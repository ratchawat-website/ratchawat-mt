"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import {
  Check,
  MapPin,
  Calendar,
  CreditCard,
  AlertCircle,
} from "lucide-react";

/* ─── Package data ─── */
const PACKAGES = [
  {
    id: "drop-in",
    name: "Drop-in Session",
    price: 500,
    priceLabel: "500 THB",
    description: "Single group class",
    sessions: "1 session",
  },
  {
    id: "weekly",
    name: "Weekly (5 Days)",
    price: 2000,
    priceLabel: "2,000 THB",
    description: "10 sessions, morning + afternoon",
    sessions: "10 sessions",
  },
  {
    id: "monthly",
    name: "Monthly Unlimited",
    price: 5500,
    priceLabel: "5,500 THB",
    description: "Unlimited group sessions",
    sessions: "Unlimited",
    popular: true,
  },
  {
    id: "private-single",
    name: "Private Lesson",
    price: 1500,
    priceLabel: "1,500 THB",
    description: "60-minute 1-on-1 session",
    sessions: "1 session",
  },
  {
    id: "private-10",
    name: "Private 10-Pack",
    price: 12000,
    priceLabel: "12,000 THB",
    description: "10 private sessions, save 20%",
    sessions: "10 sessions",
    popular: true,
  },
  {
    id: "fighter",
    name: "Fighter Monthly",
    price: 8000,
    priceLabel: "8,000 THB",
    description: "Unlimited group + 5 private/week + fight prep",
    sessions: "Unlimited+",
  },
];

const CAMPS = [
  { id: "bo-phut", name: "Bo Phut", description: "Soi Sunday, near Fisherman's Village" },
  { id: "plai-laem", name: "Plai Laem", description: "Plai Laem Soi 13, near Big Buddha" },
  { id: "both", name: "Both Camps", description: "Access to both locations" },
];

const STEPS = ["Package", "Camp", "Date", "Confirm"];

export default function BookingWidget() {
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedCamp, setSelectedCamp] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Read query params on mount
  useEffect(() => {
    const pkg = searchParams.get("package");
    const camp = searchParams.get("camp");
    if (pkg && PACKAGES.some((p) => p.id === pkg)) {
      setSelectedPackage(pkg);
      setStep(1);
    }
    if (camp && CAMPS.some((c) => c.id === camp)) {
      setSelectedCamp(camp);
      if (pkg) setStep(2);
    }
  }, [searchParams]);

  const currentPackage = PACKAGES.find((p) => p.id === selectedPackage);
  const currentCamp = CAMPS.find((c) => c.id === selectedCamp);

  const canProceed = () => {
    if (step === 0) return !!selectedPackage;
    if (step === 1) return !!selectedCamp;
    if (step === 2) return !!startDate;
    if (step === 3) return !!email && !!name;
    return false;
  };

  const handleSubmit = async () => {
    if (!currentPackage) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: `${currentPackage.name} - ${currentCamp?.name ?? "Both Camps"}`,
          amount: currentPackage.price * 100, // satang
          email,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setSubmitError(
          "Payment is not configured yet. Contact us on WhatsApp or email to book manually."
        );
      }
    } catch {
      setSubmitError(
        "Payment is not configured yet. Contact us on WhatsApp or email to book manually."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => { if (i < step) setStep(i); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step
                  ? "bg-primary text-white cursor-pointer"
                  : i === step
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-surface-lowest text-on-surface-variant"
              }`}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </button>
            <span
              className={`text-xs font-medium hidden sm:block ${
                i <= step ? "text-on-surface" : "text-on-surface-variant"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  i < step ? "bg-primary" : "bg-outline-variant"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Select Package */}
      {step === 0 && (
        <div className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Select a Package
          </h2>
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`w-full text-left rounded-[var(--radius-card)] p-4 sm:p-5 border-2 transition-all ${
                selectedPackage === pkg.id
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant bg-surface-lowest hover:border-outline"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
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
                <div className="text-right shrink-0 ml-4">
                  <span className="font-serif text-lg font-bold text-primary">
                    {pkg.priceLabel}
                  </span>
                  <p className="text-on-surface-variant text-xs">{pkg.sessions}</p>
                </div>
              </div>
            </button>
          ))}
          <p className="text-on-surface-variant text-xs mt-4 text-center">
            Not sure?{" "}
            <Link
              href="/pricing"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              Compare all packages
            </Link>
          </p>
        </div>
      )}

      {/* Step 1: Select Camp */}
      {step === 1 && (
        <div className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Choose Your Camp
          </h2>
          {CAMPS.map((camp) => (
            <button
              key={camp.id}
              onClick={() => setSelectedCamp(camp.id)}
              className={`w-full text-left rounded-[var(--radius-card)] p-4 sm:p-5 border-2 transition-all ${
                selectedCamp === camp.id
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant bg-surface-lowest hover:border-outline"
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin
                  size={20}
                  className={
                    selectedCamp === camp.id
                      ? "text-primary"
                      : "text-on-surface-variant"
                  }
                />
                <div>
                  <span className="font-serif text-base font-semibold text-on-surface">
                    {camp.name}
                  </span>
                  <p className="text-on-surface-variant text-sm">
                    {camp.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
          <p className="text-on-surface-variant text-xs mt-4 text-center">
            See{" "}
            <Link
              href="/camps/bo-phut"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              Bo Phut
            </Link>
            {" "}and{" "}
            <Link
              href="/camps/plai-laem"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              Plai Laem
            </Link>
            {" "}camp pages for details.
          </p>
        </div>
      )}

      {/* Step 2: Select Date */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Pick a Start Date
          </h2>
          <GlassCard hover={false}>
            <div className="flex items-center gap-3 mb-4">
              <Calendar size={20} className="text-primary" />
              <span className="text-on-surface font-medium">
                When do you want to start?
              </span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface focus:border-primary focus:outline-none transition-colors"
            />
            <p className="text-on-surface-variant text-xs mt-3">
              Classes run Monday to Saturday, 8 AM to 8 PM. Sunday is rest day.
            </p>
          </GlassCard>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Confirm & Pay
          </h2>

          {/* Summary */}
          <GlassCard hover={false}>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
              Booking Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Package</span>
                <span className="text-on-surface font-medium">
                  {currentPackage?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Camp</span>
                <span className="text-on-surface font-medium">
                  {currentCamp?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Start Date</span>
                <span className="text-on-surface font-medium">
                  {new Date(startDate + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-outline-variant">
                <span className="text-on-surface font-semibold">Total</span>
                <span className="font-serif text-xl font-bold text-primary">
                  {currentPackage?.priceLabel}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Contact Info */}
          <GlassCard hover={false}>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
              Your Details
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
              />
              <p className="text-on-surface-variant text-xs">
                Confirmation will be sent to this email.
              </p>
            </div>
          </GlassCard>

          {/* Error */}
          {submitError && (
            <div className="flex items-start gap-3 bg-primary/10 border-2 border-primary/30 rounded-[var(--radius-card)] p-4">
              <AlertCircle size={20} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-on-surface text-sm font-medium">
                  Online payment not available yet
                </p>
                <p className="text-on-surface-variant text-sm mt-1">
                  {submitError}
                </p>
                <div className="flex gap-3 mt-3">
                  <a
                    href="https://wa.me/66630802876"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm font-semibold hover:text-primary-dim transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a
                    href="mailto:chor.ratchawat@gmail.com"
                    className="text-primary text-sm font-semibold hover:text-primary-dim transition-colors"
                  >
                    Email
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="text-on-surface-variant text-sm font-medium hover:text-on-surface transition-colors"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={() => canProceed() && setStep(step + 1)}
            disabled={!canProceed()}
            className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-colors text-sm ${
              canProceed()
                ? "bg-primary text-white hover:bg-primary-dim"
                : "bg-surface-lowest text-on-surface-variant cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-colors text-sm ${
              canProceed() && !isSubmitting
                ? "bg-primary text-white hover:bg-primary-dim"
                : "bg-surface-lowest text-on-surface-variant cursor-not-allowed"
            }`}
          >
            <CreditCard size={16} />
            {isSubmitting ? "Processing..." : `Pay ${currentPackage?.priceLabel}`}
          </button>
        )}
      </div>
    </div>
  );
}
