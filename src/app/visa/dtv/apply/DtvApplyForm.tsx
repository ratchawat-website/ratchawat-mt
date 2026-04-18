"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getPricesByCategory, getPriceById } from "@/content/pricing";
import { buildWhatsAppUrl } from "@/content/schedule";

type DtvPriceId = "dtv-6m-2x" | "dtv-6m-4x" | "dtv-6m-unlimited";

const DTV_PACKAGES = getPricesByCategory("dtv");

interface FormState {
  first_name: string;
  last_name: string;
  nationality: string;
  phone: string;
  email: string;
  passport_number: string;
  passport_expiry: string;
  currently_in_thailand: boolean;
  training_start_date: string;
  arrival_date: string;
  price_id: DtvPriceId | "";
  committed: boolean;
}

const INITIAL_STATE: FormState = {
  first_name: "",
  last_name: "",
  nationality: "",
  phone: "",
  email: "",
  passport_number: "",
  passport_expiry: "",
  currently_in_thailand: false,
  training_start_date: "",
  arrival_date: "",
  price_id: "",
  committed: false,
};

const inputCls =
  "w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors";

function SectionTitle({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-outline-variant">
      <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
        {step}
      </span>
      <h2 className="font-serif text-lg sm:text-xl font-bold text-on-surface uppercase tracking-wide">
        {title}
      </h2>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
      {children}
      {required && <span className="text-primary ml-1">*</span>}
    </label>
  );
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (form.first_name.trim().length < 1) errors.first_name = "Required.";
  if (form.last_name.trim().length < 1) errors.last_name = "Required.";
  if (form.nationality.trim().length < 2) errors.nationality = "Required.";
  if (form.phone.trim().length < 6) errors.phone = "Enter a valid phone number.";
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = "Enter a valid email.";
  if (form.passport_number.trim().length < 4) errors.passport_number = "Required.";

  if (!form.passport_expiry) {
    errors.passport_expiry = "Required.";
  } else {
    const expiry = new Date(`${form.passport_expiry}T00:00:00`);
    const sixMonthsOut = new Date();
    sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);
    sixMonthsOut.setHours(0, 0, 0, 0);
    if (expiry < sixMonthsOut) {
      errors.passport_expiry = "Passport must be valid for at least 6 more months.";
    }
  }

  if (!form.training_start_date) errors.training_start_date = "Required.";
  if (!form.arrival_date) errors.arrival_date = "Required.";

  if (form.training_start_date && form.arrival_date) {
    const start = new Date(`${form.training_start_date}T00:00:00`);
    const arrival = new Date(`${form.arrival_date}T00:00:00`);
    if (arrival > start) {
      errors.arrival_date = "Arrival must be on or before training start.";
    }
  }

  if (!form.price_id) errors.price_id = "Please choose a package.";
  if (!form.committed) errors.committed = "Please confirm the commitment.";
  return errors;
}

export default function DtvApplyForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    const pkg = searchParams.get("package");
    if (pkg && DTV_PACKAGES.some((p) => p.id === pkg)) {
      setForm((f) => ({ ...f, price_id: pkg as DtvPriceId }));
    }
    if (searchParams.get("cancelled") === "1") {
      setCancelled(true);
    }
  }, [searchParams]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const selected = form.price_id ? getPriceById(form.price_id) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate(form);
    if (Object.keys(v).length > 0) {
      setErrors(v);
      const firstKey = Object.keys(v)[0];
      const el = document.querySelector<HTMLElement>(`[data-field="${firstKey}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    setApiError(null);
    try {
      const res = await fetch("/api/visa/dtv/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          nationality: form.nationality.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          passport_number: form.passport_number.trim(),
          passport_expiry: form.passport_expiry,
          currently_in_thailand: form.currently_in_thailand,
          training_start_date: form.training_start_date,
          arrival_date: form.arrival_date,
          price_id: form.price_id,
          committed: form.committed,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setApiError(data.error ?? "Something went wrong.");
      }
    } catch {
      setApiError("Network error. Please try again or reach out on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  const waFallback = buildWhatsAppUrl(
    "Hi, I am having trouble submitting my DTV application online. Can you help?",
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-10 bg-surface-lowest rounded-[var(--radius-card)] p-6 sm:p-8 border-2 border-outline-variant"
    >
      {cancelled && (
        <div className="rounded-[var(--radius-card)] border-2 border-primary/30 bg-primary/5 p-4 text-sm text-on-surface">
          Payment cancelled. Your details are still here, feel free to resubmit when ready.
        </div>
      )}

      {/* 1. Personal */}
      <div>
        <SectionTitle step={1} title="Personal details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div data-field="first_name">
            <FieldLabel required>First name</FieldLabel>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => update("first_name", e.target.value)}
              className={inputCls}
              autoComplete="given-name"
            />
            {errors.first_name && <p className="text-primary text-xs mt-1">{errors.first_name}</p>}
          </div>
          <div data-field="last_name">
            <FieldLabel required>Last name</FieldLabel>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => update("last_name", e.target.value)}
              className={inputCls}
              autoComplete="family-name"
            />
            {errors.last_name && <p className="text-primary text-xs mt-1">{errors.last_name}</p>}
          </div>
          <div data-field="nationality">
            <FieldLabel required>Country of origin / nationality</FieldLabel>
            <input
              type="text"
              value={form.nationality}
              onChange={(e) => update("nationality", e.target.value)}
              className={inputCls}
              autoComplete="country-name"
            />
            {errors.nationality && <p className="text-primary text-xs mt-1">{errors.nationality}</p>}
          </div>
          <div data-field="phone">
            <FieldLabel required>Phone (WhatsApp)</FieldLabel>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputCls}
              placeholder="+66 63 080 2876"
              autoComplete="tel"
            />
            {errors.phone && <p className="text-primary text-xs mt-1">{errors.phone}</p>}
          </div>
          <div className="sm:col-span-2" data-field="email">
            <FieldLabel required>Email</FieldLabel>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputCls}
              autoComplete="email"
            />
            {errors.email && <p className="text-primary text-xs mt-1">{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* 2. Passport */}
      <div>
        <SectionTitle step={2} title="Passport" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div data-field="passport_number">
            <FieldLabel required>Passport number</FieldLabel>
            <input
              type="text"
              value={form.passport_number}
              onChange={(e) => update("passport_number", e.target.value.toUpperCase())}
              className={inputCls}
            />
            {errors.passport_number && (
              <p className="text-primary text-xs mt-1">{errors.passport_number}</p>
            )}
          </div>
          <div data-field="passport_expiry">
            <FieldLabel required>Passport expiration date</FieldLabel>
            <input
              type="date"
              value={form.passport_expiry}
              onChange={(e) => update("passport_expiry", e.target.value)}
              className={inputCls}
            />
            {errors.passport_expiry && (
              <p className="text-primary text-xs mt-1">{errors.passport_expiry}</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Travel */}
      <div>
        <SectionTitle step={3} title="Travel" />
        <div className="space-y-4">
          <div>
            <FieldLabel>Are you currently in Thailand?</FieldLabel>
            <div className="flex gap-3">
              {[
                { label: "No, I apply from abroad", value: false },
                { label: "Yes, I am in Thailand", value: true },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => update("currently_in_thailand", opt.value)}
                  className={`flex-1 rounded-[var(--radius-input)] py-3 px-4 text-sm font-semibold border-2 transition-colors ${
                    form.currently_in_thailand === opt.value
                      ? "border-primary bg-primary/5 text-on-surface"
                      : "border-outline-variant bg-surface text-on-surface-variant hover:border-outline"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div data-field="arrival_date">
              <FieldLabel required>Planned arrival in Thailand</FieldLabel>
              <input
                type="date"
                value={form.arrival_date}
                onChange={(e) => update("arrival_date", e.target.value)}
                className={inputCls}
              />
              {errors.arrival_date && (
                <p className="text-primary text-xs mt-1">{errors.arrival_date}</p>
              )}
            </div>
            <div data-field="training_start_date">
              <FieldLabel required>Training start date</FieldLabel>
              <input
                type="date"
                value={form.training_start_date}
                onChange={(e) => update("training_start_date", e.target.value)}
                className={inputCls}
              />
              {errors.training_start_date && (
                <p className="text-primary text-xs mt-1">{errors.training_start_date}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Package */}
      <div>
        <SectionTitle step={4} title="Package" />
        <div data-field="price_id" className="space-y-3">
          {DTV_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => update("price_id", pkg.id as DtvPriceId)}
              className={`w-full text-left rounded-[var(--radius-card)] p-4 sm:p-5 border-2 transition-all ${
                form.price_id === pkg.id
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant bg-surface hover:border-outline"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="font-serif text-base font-semibold text-on-surface">
                    {pkg.name}
                  </span>
                  <p className="text-on-surface-variant text-sm mt-0.5">
                    {pkg.includes[0]}, {pkg.unit}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-serif text-lg font-bold text-primary">
                    {pkg.price?.toLocaleString("en-US")} THB
                  </span>
                </div>
              </div>
            </button>
          ))}
          {errors.price_id && <p className="text-primary text-xs mt-1">{errors.price_id}</p>}
        </div>

        <label
          data-field="committed"
          className="flex items-start gap-3 mt-6 p-4 rounded-[var(--radius-card)] border-2 border-outline-variant cursor-pointer hover:border-outline transition-colors"
        >
          <input
            type="checkbox"
            checked={form.committed}
            onChange={(e) => update("committed", e.target.checked)}
            className="mt-1 w-4 h-4 accent-primary"
          />
          <span className="text-on-surface-variant text-sm leading-relaxed">
            I understand that documents are delivered within 24 hours after payment. No
            refund if the visa is refused, but a training voucher of the same value will be
            issued. I commit to this training package.
          </span>
        </label>
        {errors.committed && <p className="text-primary text-xs mt-1">{errors.committed}</p>}
      </div>

      {apiError && (
        <div className="rounded-[var(--radius-card)] border-2 border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
          <MessageCircle size={20} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-semibold text-on-surface mb-1">We hit a snag</p>
            <p className="text-on-surface-variant mb-2">{apiError}</p>
            <a
              href={waFallback}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dim font-semibold inline-flex items-center gap-1"
            >
              Message us on WhatsApp
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting
            ? "Redirecting to payment..."
            : selected && selected.price
              ? `Continue to payment — ${selected.price.toLocaleString("en-US")} THB`
              : "Continue to payment"}
          <span className="btn-arrow">&rarr;</span>
        </button>
        <Link href="/visa/dtv" className="btn-ghost w-full sm:w-auto justify-center">
          Back to DTV page
        </Link>
      </div>
    </form>
  );
}
