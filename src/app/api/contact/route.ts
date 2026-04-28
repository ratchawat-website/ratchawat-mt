import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ContactRequestSchema, escapeHtml } from "@/lib/validation/contact";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL ?? "Ratchawat Muay Thai <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "chor.ratchawat@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = ContactRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid contact request", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const { name, email, subject, message } = parsed.data;

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    const resend = getResend();

    const adminResult = await resend.emails.send({
      from: FROM_ADDRESS,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `[Ratchawat Muay Thai] Contact - ${subject || "New message"}`,
      html: `
        <h2>New contact message</h2>
        <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
        ${subject ? `<p><strong>Subject:</strong> ${safeSubject}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `,
    });

    if (adminResult.error) {
      console.error("Resend admin send error:", adminResult.error);
      return NextResponse.json(
        { error: "Failed to send admin notification", detail: adminResult.error },
        { status: 500 },
      );
    }

    const userResult = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "Ratchawat Muay Thai - We received your message",
      html: `
        <p>Hi ${safeName},</p>
        <p>Thank you for contacting us. We received your message and will get back to you shortly.</p>
        <p>Best regards,<br>The Ratchawat Muay Thai Team</p>
      `,
    });

    if (userResult.error) {
      console.error("Resend user confirmation error:", userResult.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
