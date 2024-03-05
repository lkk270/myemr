import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import * as React from "react";

interface TwoFactorConfirmationProps {
  verificationToken: string;
}

export const TwoFactorConfirmationEmail = ({ verificationToken }: TwoFactorConfirmationProps) => (
  <Html>
    <Head />
    <Preview>MyEmr 2FA code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              // textAlign: "center",
            }}
          >
            <img
              src="https://res.cloudinary.com/ddr7l73bu/image/upload/v1708784793/logo_wuhwbw.png"
              alt="MyEmr Logo"
              style={{ width: "42px", height: "42px", verticalAlign: "middle" }}
            />
            <span style={{ lineHeight: "42px", verticalAlign: "middle", paddingLeft: "4px" }}>MyEMR</span>
          </div>
        </Section>
        <Heading style={h1}>2FA Code</Heading>
        <Text style={heroText}>
          Your 2FA code is below - enter it in your open browser window to proceed with logging into your account. The
          code is valid for 5 minutes.
        </Text>

        <Section style={codeBox}>
          <Text style={confirmationCodeText}>{verificationToken}</Text>
        </Section>

        <Text style={text}>If you didn't request this email, you can safely ignore it.</Text>

        <Section>
          <Link style={footerLink} href="https://myemr.io" target="_blank" rel="noopener noreferrer">
            Home
          </Link>
          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
          <Link style={footerLink} href="https://myemr.io/legal" target="_blank" rel="noopener noreferrer">
            Terms
          </Link>
          <Text style={footerText}>
            ©2024 MyEmr <br />
            <br />
            All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const footerText = {
  fontSize: "12px",
  color: "#b7b7b7",
  lineHeight: "15px",
  textAlign: "left" as const,
  marginBottom: "50px",
};

const footerLink = {
  color: "#b7b7b7",
  textDecoration: "underline",
};

// const footerLogos = {
//   marginBottom: "32px",
//   paddingLeft: "8px",
//   paddingRight: "8px",
//   width: "100%",
// };

// const socialMediaIcon = {
//   display: "inline",
//   marginLeft: "32px",
// };

const main = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "0px 20px",
};

const logoContainer = {
  marginTop: "32px",
};

const h1 = {
  color: "#1d1c1d",
  fontSize: "34px",
  fontWeight: "700",
  margin: "30px 0",
  padding: "0",
  lineHeight: "42px",
};

const heroText = {
  fontSize: "20px",
  lineHeight: "28px",
  marginBottom: "30px",
};

const codeBox = {
  background: "rgb(245, 244, 245)",
  borderRadius: "4px",
  marginBottom: "30px",
  padding: "40px 10px",
};

const confirmationCodeText = {
  fontSize: "30px",
  textAlign: "center" as const,
  verticalAlign: "middle",
};

const text = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "24px",
};
