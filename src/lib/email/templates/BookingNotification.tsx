import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import type { BookingEmailData } from "../types";

interface Props {
  booking: BookingEmailData;
  packageName: string;
}

export function BookingNotification({ booking, packageName }: Props) {
  return (
    <Html>
      <Head />
      <Preview>
        New booking: {packageName} - {booking.client_name}
      </Preview>
      <Body style={{ fontFamily: "Arial, sans-serif" }}>
        <Container style={{ padding: 24, maxWidth: 560 }}>
          <Heading>New booking received</Heading>

          <Section>
            <Text>
              <strong>Package:</strong> {packageName} ({booking.price_id})
            </Text>
            <Text>
              <strong>Type:</strong> {booking.type}
            </Text>
            <Text>
              <strong>Amount:</strong>{" "}
              {booking.price_amount.toLocaleString()} THB
            </Text>
            <Text>
              <strong>Participants:</strong> {booking.num_participants}
            </Text>
          </Section>

          <Hr />

          <Heading as="h2">Dates</Heading>
          <Text>
            <strong>Start:</strong> {booking.start_date}
          </Text>
          {booking.end_date && (
            <Text>
              <strong>End:</strong> {booking.end_date}
            </Text>
          )}
          {booking.time_slot && (
            <Text>
              <strong>Time slot:</strong> {booking.time_slot}
            </Text>
          )}
          {booking.camp && (
            <Text>
              <strong>Camp:</strong> {booking.camp}
            </Text>
          )}

          <Hr />

          <Heading as="h2">Client</Heading>
          <Text>
            <strong>Name:</strong> {booking.client_name}
          </Text>
          <Text>
            <strong>Email:</strong> {booking.client_email}
          </Text>
          <Text>
            <strong>Phone:</strong> {booking.client_phone}
          </Text>
          {booking.client_nationality && (
            <Text>
              <strong>Nationality:</strong> {booking.client_nationality}
            </Text>
          )}
          {booking.notes && (
            <Text>
              <strong>Notes:</strong> {booking.notes}
            </Text>
          )}

          <Hr />
          <Text style={{ fontSize: 11, color: "#666" }}>
            Booking ID: {booking.id}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
