import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
} from "@react-email/components";
import type { BookingEmailData } from "../types";

interface Props {
  booking: BookingEmailData;
  packageName: string;
}

const CAMP_LABEL: Record<string, string> = {
  "bo-phut": "Bo Phut",
  "plai-laem": "Plai Laem",
  both: "Plai Laem stay, both camps for training",
};

export function BookingConfirmed({ booking, packageName }: Props) {
  return (
    <Html>
      <Head />
      <Preview>
        Your Muay Thai booking at Ratchawat Koh Samui is confirmed
      </Preview>
      <Body
        style={{
          fontFamily: "Inter, Arial, sans-serif",
          backgroundColor: "#0a0a0a",
          color: "#f5f5f5",
        }}
      >
        <Container style={{ padding: 24, maxWidth: 560 }}>
          <Heading style={{ color: "#ff6600" }}>Booking confirmed</Heading>
          <Text>Hi {booking.client_name},</Text>
          <Text>
            Thanks for booking with Ratchawat Muay Thai in Koh Samui. Your
            training is locked in. Here is your summary.
          </Text>

          <Section>
            <Text>
              <strong>Package:</strong> {packageName}
            </Text>
            <Text>
              <strong>Start date:</strong> {booking.start_date}
            </Text>
            {booking.end_date && (
              <Text>
                <strong>End date:</strong> {booking.end_date}
              </Text>
            )}
            {booking.time_slot && (
              <Text>
                <strong>Time:</strong> {booking.time_slot}
              </Text>
            )}
            {booking.camp && (
              <Text>
                <strong>Location:</strong> {CAMP_LABEL[booking.camp]}
              </Text>
            )}
            <Text>
              <strong>Total paid:</strong>{" "}
              {booking.price_amount.toLocaleString()} THB
            </Text>
          </Section>

          <Hr />

          <Heading as="h2">What happens next</Heading>
          <Text>
            Show up 10 minutes before your first session. Bring shorts and a
            t-shirt. We provide gloves, shin guards, and wraps.
          </Text>

          <Heading as="h3">Address</Heading>
          <Text>
            <Link href="https://maps.google.com/?q=Plai+Laem+Muay+Thai+Koh+Samui">
              Plai Laem camp - Soi Sunday
            </Link>
            {" · "}
            <Link href="https://maps.google.com/?q=Bo+Phut+Muay+Thai+Koh+Samui">
              Bo Phut camp - Fisherman Village
            </Link>
          </Text>

          <Heading as="h3">Need to reach us</Heading>
          <Text>
            WhatsApp:{" "}
            <Link href="https://wa.me/66630802876">+66 63 080 2876</Link>
          </Text>
          <Text>
            Email:{" "}
            <Link href="mailto:chor.ratchawat@gmail.com">
              chor.ratchawat@gmail.com
            </Link>
          </Text>

          <Hr />
          <Text style={{ fontSize: 12, color: "#999" }}>
            Booking ID: {booking.id}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
