import { NextResponse } from "next/server";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: Request) {
  try {
    const { name, email, message, subject } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const resend = getResend();

    await resend.emails.send({
      from: "contact@ratchawatmuaythai.com",
      to: "chor.ratchawat@gmail.com",
      subject: `[Ratchawat Muay Thai] Contact - ${subject || "New message"}`,
      html: `
        <h2>New contact message</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    await resend.emails.send({
      from: "contact@ratchawatmuaythai.com",
      to: email,
      subject: "Ratchawat Muay Thai - We received your message",
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for contacting us. We received your message and will get back to you shortly.</p>
        <p>Best regards,<br>The Ratchawat Muay Thai Team</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
