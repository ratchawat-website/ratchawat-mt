"use client";

import { useState, FormEvent } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import GlassCard from "./GlassCard";
import TurnstileWidget from "@/components/security/TurnstileWidget";
import {
  TURNSTILE_ENABLED,
  useTurnstile,
} from "@/components/security/use-turnstile";

type FormStatus = "idle" | "sending" | "success" | "error";

const inputClasses =
  "w-full bg-[#111] border-2 border-outline-variant rounded-[6px] px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:shadow-[0_0_0_1px_rgba(255,102,0,0.1)] focus:outline-none transition-all text-sm";

const labelClasses =
  "block text-[10px] uppercase tracking-[0.125em] text-[#666] mb-1.5 font-medium";

const subjects = [
  "General Inquiry",
  "Booking Question",
  "Visa Support",
  "Group Booking",
  "Other",
];

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const captcha = useTurnstile();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!captcha.ready) {
      setStatus("error");
      return;
    }
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cf_turnstile_token: captcha.token,
        }),
      });

      if (!res.ok) throw new Error("Failed to send");
      setStatus("success");
      setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
      captcha.reset();
    } catch {
      setStatus("error");
      captcha.reset();
    }
  }

  if (status === "success") {
    return (
      <GlassCard hover={false}>
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <CheckCircle size={48} className="text-green-500" />
          <h3 className="font-serif text-xl font-bold text-on-surface">
            Message Sent
          </h3>
          <p className="text-on-surface-variant text-sm max-w-sm">
            We received your message and will get back to you shortly. Check
            your email for a confirmation.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-2 btn-link"
          >
            Send another message
          </button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard hover={false}>
      {/* Kicker */}
      <div className="flex items-center gap-3 mb-2">
        <span className="w-8 h-[2px] bg-primary" />
        <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
          Get in touch
        </span>
      </div>

      <h3 className="font-serif text-2xl font-bold text-on-surface uppercase mb-6">
        Send Us a Message
      </h3>

      {status === "error" && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-red-900/20 border-2 border-red-900/40 rounded-[6px] text-sm text-red-400">
          <AlertCircle size={16} className="shrink-0" />
          Something went wrong. Please try again or contact us directly.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className={labelClasses}>Name</label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputClasses}
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClasses}>Email</label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputClasses}
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="subject" className={labelClasses}>Subject</label>
          <select
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className={`${inputClasses} appearance-none pr-10`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23999' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/></svg>\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.85rem center",
              backgroundSize: "1rem 1rem",
            }}
          >
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message" className={labelClasses}>Message</label>
          <textarea
            id="message"
            required
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className={`${inputClasses} resize-vertical`}
            placeholder="How can we help you?"
          />
        </div>

        <TurnstileWidget
          onVerify={captcha.onVerify}
          onExpire={captcha.onExpire}
          action="contact"
        />

        <button
          type="submit"
          disabled={
            status === "sending" || (TURNSTILE_ENABLED && !captcha.ready)
          }
          className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "sending" ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Sending...
            </>
          ) : (
            <>Send Message <span className="btn-arrow">&rarr;</span></>
          )}
        </button>
      </form>
    </GlassCard>
  );
}
