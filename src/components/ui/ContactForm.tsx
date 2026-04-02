"use client";

import { useState, FormEvent } from "react";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import GlassCard from "./GlassCard";

type FormStatus = "idle" | "sending" | "success" | "error";

const inputClasses =
  "w-full bg-surface-low border-2 border-outline rounded-[var(--radius-input)] px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors text-sm";

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to send");
      setStatus("success");
      setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
    } catch {
      setStatus("error");
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
            className="mt-2 text-primary text-sm font-semibold hover:text-primary-dim transition-colors"
          >
            Send another message
          </button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard hover={false}>
      <h3 className="font-serif text-xl font-bold text-on-surface uppercase mb-6">
        Send Us a Message
      </h3>

      {status === "error" && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-red-900/20 border-2 border-red-900/40 rounded-[var(--radius-input)] text-sm text-red-400">
          <AlertCircle size={16} className="shrink-0" />
          Something went wrong. Please try again or contact us directly.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm text-on-surface-variant mb-1.5">
            Name
          </label>
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
          <label htmlFor="email" className="block text-sm text-on-surface-variant mb-1.5">
            Email
          </label>
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
          <label htmlFor="subject" className="block text-sm text-on-surface-variant mb-1.5">
            Subject
          </label>
          <select
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className={inputClasses}
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm text-on-surface-variant mb-1.5">
            Message
          </label>
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

        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-semibold px-6 py-3 rounded-[0.5rem] hover:bg-primary-dim transition-colors w-full disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "sending" ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Sending...
            </>
          ) : (
            <>
              <Send size={18} /> Send Message
            </>
          )}
        </button>
      </form>
    </GlassCard>
  );
}
