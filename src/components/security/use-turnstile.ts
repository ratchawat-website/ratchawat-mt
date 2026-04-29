"use client";

import { useCallback, useState } from "react";

export const TURNSTILE_ENABLED =
  !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Captcha state for forms. When Turnstile is not configured, `ready` is
 * always true so the submit button never gets stuck disabled in dev.
 */
export function useTurnstile() {
  const [token, setToken] = useState<string | null>(null);
  const onVerify = useCallback((t: string) => setToken(t), []);
  const onExpire = useCallback(() => setToken(null), []);
  const reset = useCallback(() => setToken(null), []);
  const ready = !TURNSTILE_ENABLED || token !== null;
  return { token, onVerify, onExpire, reset, ready };
}
