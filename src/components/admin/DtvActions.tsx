"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileCheck, XCircle, AlertTriangle, LogOut, Mail } from "lucide-react";

interface Props {
  applicationId: string;
  status: string;
}

type Transition = {
  label: string;
  targetStatus: string;
  icon: React.ReactNode;
  className: string;
  confirm?: string;
};

const TRANSITIONS: Record<string, Transition[]> = {
  paid: [
    {
      label: "Mark Docs Sent",
      targetStatus: "docs_sent",
      icon: <FileCheck size={15} />,
      className:
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-400 border-2 border-blue-500/30 hover:bg-blue-500/20 transition-colors disabled:opacity-50",
    },
    {
      label: "Visa Refused · Issue Voucher",
      targetStatus: "refused_voucher_issued",
      icon: <AlertTriangle size={15} />,
      className:
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-400 border-2 border-purple-500/30 hover:bg-purple-500/20 transition-colors disabled:opacity-50",
      confirm:
        "Mark this DTV application as refused and issue a training voucher of the same value?",
    },
    {
      label: "Cancel",
      targetStatus: "cancelled",
      icon: <XCircle size={15} />,
      className:
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-red-500/10 text-red-400 border-2 border-red-500/30 hover:bg-red-500/20 transition-colors disabled:opacity-50",
    },
  ],
  docs_sent: [
    {
      label: "Visa Refused · Issue Voucher",
      targetStatus: "refused_voucher_issued",
      icon: <AlertTriangle size={15} />,
      className:
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-400 border-2 border-purple-500/30 hover:bg-purple-500/20 transition-colors disabled:opacity-50",
      confirm:
        "Mark this DTV application as refused and issue a training voucher of the same value?",
    },
  ],
};

export default function DtvActions({ applicationId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transitions = TRANSITIONS[status] ?? [];

  async function handleTransition(t: Transition) {
    if (t.confirm && !window.confirm(t.confirm)) return;

    setLoading(t.targetStatus);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/dtv-applications/${applicationId}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: t.targetStatus }),
        },
      );
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
      const res = await fetch(
        `/api/admin/dtv-applications/${applicationId}/resend-email`,
        { method: "POST" },
      );
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
              onClick={() => handleTransition(t)}
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

      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
