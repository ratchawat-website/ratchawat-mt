/**
 * Build the origin used for Stripe Checkout success/cancel URLs.
 *
 * In production, always trust NEXT_PUBLIC_SITE_URL. Reading from the request
 * Host/Origin header would let an attacker forge those values and redirect
 * the victim post-payment to a domain they control.
 *
 * In dev (no NEXT_PUBLIC_SITE_URL or NODE_ENV !== "production"), fall back to
 * the request headers so localhost and LAN testing keep working.
 */
export function getCheckoutOrigin(request: Request): string {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_SITE_URL
  ) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const fromOrigin = request.headers.get("origin");
  if (fromOrigin) return fromOrigin;

  const host = request.headers.get("host");
  if (host) {
    const proto =
      request.headers.get("x-forwarded-proto") ??
      (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}
