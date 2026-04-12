"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Award, LogOut, Mail } from "lucide-react";

interface Props {
  bookingId: string;
  status: string;
}

type Transition = {
  label: string;
  targetStatus: string;
  icon: React.ReactNode;
  className: string;
};

const TRANSITIONS: Record<string, Transition[]> = {
  pending: [
    {
      label: "Mark Confirmed",
      targetStatus: "confirmed",
      icon: <CheckCircle size={15} />,
      className:
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/30 hover:bg-emerald-500/20 transition-colors disabled:opacity-50",
    },
    {
      label: "Cancel",
      targetStatus: "cancelled",
      icon: <XCircle size={15} />,
      className:
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-red-500/10 text-red-400 border-2 border-red-500/30 hover:bg-red-500/20 transition-colors disabled:opacity-50",
    },
  ],
  confirmed: [
    {
      label: "Mark Completed",
      targetStatus: "completed",
      icon: <Award size={15} />,
      className:
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-400 border-2 border-blue-500/30 hover:bg-blue-500/20 transition-colors disabled:opacity-50",
    },
    {
      label: "Cancel",
      targetStatus: "cancelled",
      icon: <XCircle size={15} />,
      className:
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-red-500/10 text-red-400 border-2 border-red-500/30 hover:bg-red-500/20 transition-colors disabled:opacity-50",
    },
  ],
};

export default function BookingActions({ bookingId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transitions = TRANSITIONS[status] ?? [];

  async function handleTransition(targetStatus: string) {
    setLoading(targetStatus);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to update status");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(null);
    }
  }

  async function handleResendEmail() {
    setLoading("resend");
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/resend-email`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to resend email");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
        Actions
      </p>
      {transitions.length === 0 ? (
        <p className="text-sm text-on-surface-variant flex items-center gap-1.5">
          <LogOut size={14} />
          No actions available
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {transitions.map((t) => (
            <button
              key={t.targetStatus}
              onClick={() => handleTransition(t.targetStatus)}
              disabled={loading !== null}
              className={t.className}
            >
              {loading === t.targetStatus ? (
                <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                t.icon
              )}
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="pt-1">
        <button
          onClick={handleResendEmail}
          disabled={loading !== null}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-surface-lowest text-on-surface-variant border-2 border-outline-variant hover:text-on-surface hover:border-outline transition-colors disabled:opacity-50"
        >
          {loading === "resend" ? (
            <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Mail size={14} />
          )}
          Resend Confirmation Email
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
