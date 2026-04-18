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

export interface DtvApplicationEmailData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  nationality: string;
  passport_number: string;
  passport_expiry: string;
  currently_in_thailand: boolean;
  training_start_date: string;
  arrival_date: string;
  price_id: string;
  price_amount: number;
}

interface Props {
  application: DtvApplicationEmailData;
  packageName: string;
}

export function DTVApplicationReceived({ application, packageName }: Props) {
  return (
    <Html>
      <Head />
      <Preview>
        Your DTV training application at Chor Ratchawat is received
      </Preview>
      <Body
        style={{
          fontFamily: "Inter, Arial, sans-serif",
          backgroundColor: "#0a0a0a",
          color: "#f5f5f5",
        }}
      >
        <Container style={{ padding: 24, maxWidth: 560 }}>
          <Heading style={{ color: "#ff6600" }}>
            DTV application received
          </Heading>
          <Text>Hi {application.first_name},</Text>
          <Text>
            Thanks for applying for the Destination Thailand Visa (DTV) training
            package with Chor Ratchawat Muay Thai. Your payment is confirmed. We
            will email your official enrollment letter and supporting documents
            within 24 hours.
          </Text>

          <Section>
            <Heading as="h2">Your package</Heading>
            <Text>
              <strong>Package:</strong> {packageName}
            </Text>
            <Text>
              <strong>Total paid:</strong>{" "}
              {application.price_amount.toLocaleString("en-US")} THB
            </Text>
          </Section>

          <Section>
            <Heading as="h2">Your details</Heading>
            <Text>
              <strong>Name:</strong> {application.first_name}{" "}
              {application.last_name}
            </Text>
            <Text>
              <strong>Nationality:</strong> {application.nationality}
            </Text>
            <Text>
              <strong>Passport:</strong> {application.passport_number} (expires{" "}
              {application.passport_expiry})
            </Text>
            <Text>
              <strong>Arrival in Thailand:</strong> {application.arrival_date}
            </Text>
            <Text>
              <strong>Training start:</strong> {application.training_start_date}
            </Text>
          </Section>

          <Hr />

          <Heading as="h2">What happens next</Heading>
          <Text>
            <strong>1. Within 24 hours</strong> you will receive your
            enrollment letter and supporting documents by email.
          </Text>
          <Text>
            <strong>2. Submit your DTV application online</strong> on the
            official Thai e-visa portal:{" "}
            <Link
              href="https://thaievisa.go.th/"
              style={{ color: "#ff6600" }}
            >
              https://thaievisa.go.th/
            </Link>
            . Upload the documents we sent you. The embassy charges a
            10,000 THB fee, paid directly on the portal.
          </Text>
          <Text>
            <strong>3. Once approved</strong>, fly to Koh Samui and start
            training. Your 180 days begin on entry.
          </Text>

          <Hr />

          <Heading as="h3">Important notice</Heading>
          <Text style={{ fontSize: 13, color: "#cccccc" }}>
            If your DTV visa is refused, we do not refund the training package,
            but we issue a training voucher of the same value (25,000 THB for
            the 4x/week package, for example). You can use this voucher any
            time you come to train with us.
          </Text>

          <Hr />

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
            Application ID: {application.id}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
