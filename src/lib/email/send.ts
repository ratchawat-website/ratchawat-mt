import { Resend } from "resend";
import { render } from "@react-email/render";
import { BookingConfirmed } from "./templates/BookingConfirmed";
import { BookingNotification } from "./templates/BookingNotification";
import {
  DTVApplicationReceived,
  type DtvApplicationEmailData,
} from "./templates/DTVApplicationReceived";
import { DTVAdminNotification } from "./templates/DTVAdminNotification";
import type { BookingEmailData } from "./types";
import { getPriceById } from "@/content/pricing";

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_FALLBACK_DEV = "Ratchawat Muay Thai <onboarding@resend.dev>";
const FROM_FALLBACK_PROD = "Ratchawat Muay Thai <bookings@ratchawatmuaythai.com>";

function getFromAddress(): string {
  if (process.env.RESEND_BOOKINGS_FROM) return process.env.RESEND_BOOKINGS_FROM;
  if (process.env.RESEND_FROM_EMAIL) return process.env.RESEND_FROM_EMAIL;
  return process.env.NODE_ENV === "production"
    ? FROM_FALLBACK_PROD
    : FROM_FALLBACK_DEV;
}

export async function sendBookingConfirmationEmail(booking: BookingEmailData) {
  const resend = getResend();
  const pkg = getPriceById(booking.price_id);
  const packageName = pkg?.name ?? booking.price_id;

  const html = await render(BookingConfirmed({ booking, packageName }));

  return resend.emails.send({
    from: getFromAddress(),
    to: booking.client_email,
    subject: "Your booking at Ratchawat Muay Thai is confirmed",
    html,
  });
}

export async function sendAdminNotificationEmail(booking: BookingEmailData) {
  const resend = getResend();
  const pkg = getPriceById(booking.price_id);
  const packageName = pkg?.name ?? booking.price_id;

  const html = await render(BookingNotification({ booking, packageName }));

  const adminEmail = process.env.ADMIN_EMAIL ?? "chor.ratchawat@gmail.com";

  return resend.emails.send({
    from: getFromAddress(),
    to: adminEmail,
    subject: `New booking: ${packageName} - ${booking.client_name}`,
    html,
  });
}

export async function sendDtvApplicationReceivedEmail(
  application: DtvApplicationEmailData,
) {
  const resend = getResend();
  const pkg = getPriceById(application.price_id);
  const packageName = pkg?.name ?? application.price_id;

  const html = await render(
    DTVApplicationReceived({ application, packageName }),
  );

  return resend.emails.send({
    from: getFromAddress(),
    to: application.email,
    subject:
      "Your DTV training application at Chor Ratchawat - documents within 24h",
    html,
  });
}

export async function sendDtvAdminNotificationEmail(
  application: DtvApplicationEmailData,
) {
  const resend = getResend();
  const pkg = getPriceById(application.price_id);
  const packageName = pkg?.name ?? application.price_id;

  const adminEmail = process.env.ADMIN_EMAIL ?? "chor.ratchawat@gmail.com";

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";
  const adminDashboardUrl = `${siteUrl}/admin/dtv-applications/${application.id}`;

  const html = await render(
    DTVAdminNotification({ application, packageName, adminDashboardUrl }),
  );

  return resend.emails.send({
    from: getFromAddress(),
    to: adminEmail,
    subject: `[DTV] ${application.first_name} ${application.last_name} — ${packageName} — ${application.price_amount.toLocaleString("en-US")} THB paid`,
    html,
  });
}
