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
import type { DtvApplicationEmailData } from "./DTVApplicationReceived";

interface Props {
  application: DtvApplicationEmailData;
  packageName: string;
  adminDashboardUrl: string;
}

export function DTVAdminNotification({
  application,
  packageName,
  adminDashboardUrl,
}: Props) {
  const waPhone = application.phone.replace(/\D/g, "");

  return (
    <Html>
      <Head />
      <Preview>
        New paid DTV application: {application.first_name}{" "}
        {application.last_name} - {packageName}
      </Preview>
      <Body style={{ fontFamily: "Arial, sans-serif" }}>
        <Container style={{ padding: 24, maxWidth: 560 }}>
          <Heading>New paid DTV application</Heading>
          <Text style={{ color: "#b35900", fontWeight: "bold" }}>
            Send the enrollment letter and supporting documents within 24 hours.
          </Text>

          <Section>
            <Heading as="h2">Package</Heading>
            <Text>
              <strong>Package:</strong> {packageName} ({application.price_id})
            </Text>
            <Text>
              <strong>Amount paid:</strong>{" "}
              {application.price_amount.toLocaleString("en-US")} THB
            </Text>
          </Section>

          <Hr />

          <Heading as="h2">Client contact</Heading>
          <Text>
            <strong>Name:</strong> {application.first_name}{" "}
            {application.last_name}
          </Text>
          <Text>
            <strong>Email:</strong>{" "}
            <Link href={`mailto:${application.email}`}>
              {application.email}
            </Link>
          </Text>
          <Text>
            <strong>Phone:</strong>{" "}
            <Link href={`tel:${application.phone}`}>{application.phone}</Link>
            {" · "}
            <Link href={`https://wa.me/${waPhone}`}>WhatsApp</Link>
          </Text>
          <Text>
            <strong>Nationality:</strong> {application.nationality}
          </Text>

          <Hr />

          <Heading as="h2">Passport</Heading>
          <Text>
            <strong>Number:</strong> {application.passport_number}
          </Text>
          <Text>
            <strong>Expires:</strong> {application.passport_expiry}
          </Text>

          <Hr />

          <Heading as="h2">Travel</Heading>
          <Text>
            <strong>Currently in Thailand:</strong>{" "}
            {application.currently_in_thailand ? "Yes" : "No"}
          </Text>
          <Text>
            <strong>Planned arrival:</strong> {application.arrival_date}
          </Text>
          <Text>
            <strong>Training start:</strong> {application.training_start_date}
          </Text>

          <Hr />

          <Section>
            <Text>
              <Link href={adminDashboardUrl}>Open in admin dashboard</Link>
            </Text>
          </Section>

          <Hr />
          <Text style={{ fontSize: 11, color: "#666" }}>
            Application ID: {application.id}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
