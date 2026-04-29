import { NextResponse } from "next/server";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Server-side verification of a Cloudflare Turnstile token.
 *
 * No-op when TURNSTILE_SECRET_KEY is unset, so dev and PRs without the secret
 * keep working. In production, set the env var and pass the captcha token in
 * the request body as `cf_turnstile_token` (or call this helper directly).
 */
export async function verifyTurnstile(
  token: string | undefined | null,
  request?: Request,
): Promise<NextResponse | null> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return null;

  if (!token) {
    return NextResponse.json(
      { error: "Captcha required" },
      { status: 400 },
    );
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (request) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip");
    if (ip) body.set("remoteip", ip);
  }

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
      hostname?: string;
      action?: string;
    };
    if (data.success) return null;
    console.warn("Turnstile verify failed:", data);
  } catch (err) {
    console.error("Turnstile verify error:", err);
  }

  return NextResponse.json(
    { error: "Captcha verification failed" },
    { status: 400 },
  );
}
