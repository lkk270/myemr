import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";

interface MagicLinkEmailProps {
  magicLink: string;
  type: "emailConfirmation" | "passwordReset";
}

export const MagicLinkEmail = ({ magicLink, type }: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>{type === "emailConfirmation" ? "Confirm your account" : "Reset Password Link"}</Preview>
    <Body style={main}>
      <Container style={container}>
        <div
          style={{
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          <img
            src="https://res.cloudinary.com/ddr7l73bu/image/upload/v1708784793/logo_wuhwbw.png"
            alt="MyEmr Logo"
            style={{ width: "42px", height: "42px", verticalAlign: "middle" }}
          />
          <span style={{ lineHeight: "42px", verticalAlign: "middle", paddingLeft: "4px" }}>MyEMR</span>
        </div>
        <Heading style={heading}>🪄 Your magic link</Heading>
        <Section style={body}>
          <Text style={paragraph}>
            <Button style={button} href={magicLink}>
              {type === "emailConfirmation" ? "Confirm email" : "Reset Password"}
            </Button>
          </Text>
          <Text style={paragraph}>If you didn't request this, please ignore this email.</Text>
        </Section>
        <Text style={paragraph}>
          Best,
          <br />- MyEmr Team
        </Text>
        <Hr style={hr} />
        {/* <Img
            src="https://res.cloudinary.com/ddr7l73bu/image/upload/v1708784793/logo_wuhwbw.png"
            width={32}
            height={32}
            style={{
              WebkitFilter: "grayscale(100%)",
              filter: "grayscale(100%)",
              margin: "20px 0",
            }}
          /> */}
        <Text style={footer}>myemr © 2024</Text>
        <Text style={footer}>All rights reserved</Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 25px 48px",
  // backgroundImage: 'url("/assets/raycast-bg.png")',
  backgroundPosition: "bottom",
  backgroundRepeat: "no-repeat, no-repeat",
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  marginTop: "48px",
};

const body = {
  margin: "24px 0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
};

const button = {
  backgroundColor: "#8569e0",
  borderRadius: "3px",
  fontWeight: "600",
  color: "#fff",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "11px 23px",
};

const link = {
  color: "#a389fa",
};

const hr = {
  borderColor: "#dddddd",
  marginTop: "48px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  marginLeft: "4px",
};
