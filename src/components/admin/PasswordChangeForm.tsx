"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, Check } from "lucide-react";

const inputCls =
  "w-full bg-surface border-2 border-outline-variant rounded-lg px-3 py-2.5 pr-10 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors";

export default function PasswordChangeForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (next === current) {
      setError("New password must be different from the current one.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: current,
          new_password: next,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update password");
      } else {
        setSuccess(true);
        setCurrent("");
        setNext("");
        setConfirm("");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4 space-y-4"
    >
      <div className="flex items-center gap-2">
        <KeyRound size={16} className="text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface">
          Change password
        </h2>
      </div>

      <div>
        <label
          htmlFor="current-password"
          className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5"
        >
          Current password
        </label>
        <div className="relative">
          <input
            id="current-password"
            type={showCurrent ? "text" : "password"}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            aria-label={showCurrent ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant hover:text-on-surface"
          >
            {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="new-password"
          className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5"
        >
          New password
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showNext ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => setShowNext((v) => !v)}
            aria-label={showNext ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant hover:text-on-surface"
          >
            {showNext ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <p className="text-xs text-on-surface-variant mt-1">
          At least 8 characters.
        </p>
      </div>

      <div>
        <label
          htmlFor="confirm-password"
          className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5"
        >
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type={showNext ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
          className={inputCls.replace("pr-10", "pr-3")}
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border-2 border-red-500/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-xs text-emerald-400 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-md px-3 py-2 flex items-center gap-2">
          <Check size={13} />
          Password updated.
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-primary/10 text-primary border-2 border-primary/30 hover:bg-primary/20 transition-colors disabled:opacity-50"
      >
        {saving ? (
          <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <KeyRound size={13} />
        )}
        Update password
      </button>
    </form>
  );
}
