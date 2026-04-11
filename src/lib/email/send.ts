import { Resend } from "resend";
import { render } from "@react-email/render";
import { BookingConfirmed } from "./templates/BookingConfirmed";
import { BookingNotification } from "./templates/BookingNotification";
import type { BookingEmailData } from "./types";
import { getPriceById } from "@/content/pricing";

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_DEV = "Ratchawat Muay Thai <onboarding@resend.dev>";
const FROM_PROD = "Ratchawat Muay Thai <bookings@ratchawatmuaythai.com>";

function getFromAddress(): string {
  return process.env.NODE_ENV === "production" ? FROM_PROD : FROM_DEV;
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
