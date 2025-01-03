import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import { Tailwind } from "@react-email/tailwind";

interface InvitedToOrganizationEmailNoAccountProps {
  inviteToken: string;
  organizationName: string;
}

export const InvitedToOrganizationEmailNoAccount = ({
  inviteToken,
  organizationName,
}: InvitedToOrganizationEmailNoAccountProps) => (
  <Html>
    <Head />
    <Preview>MyEmr Organization Invite Code</Preview>
    <Tailwind>
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
                src="https://res.cloudinary.com/dutsfmx0g/image/upload/v1723437881/logoPng_taegde.png"
                alt="MyEmr Logo"
                style={{ width: "42px", height: "42px", verticalAlign: "middle" }}
              />
              <span style={{ lineHeight: "42px", verticalAlign: "middle", paddingLeft: "4px" }}>MyEMR</span>
            </div>
          </Section>
          <Heading style={h1}>
            You have been invited to the MyEmr organization: <span className="italic">{organizationName}</span>
          </Heading>
          <Text style={heroText}>
            There is no MyEmr Provider account associated with this email, so you must click the button below to create
            one. Upon successfully signing up, click "Enter invite code" and enter the code found below to join{" "}
            <span className="italic">{organizationName}</span>.
          </Text>
          <Button style={button} href={"https://myemr.io/auth/provider-register"}>
            Sign up
          </Button>
          <Text style={text}>The invite code is valid for 72 hours</Text>
          <Section style={codeBox}>
            <Text style={confirmationCodeText}>{inviteToken}</Text>
          </Section>

          <Section>
            <Link style={footerLink} href="https://myemr.io" target="_blank" rel="noopener noreferrer">
              Home
            </Link>
            &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
            <Link style={footerLink} href="https://myemr.io/terms" target="_blank" rel="noopener noreferrer">
              Terms
            </Link>
            <Text style={footerText}>
              ©2025 MyEmr <br />
              <br />
              All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
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
  fontSize: "30px",
  fontWeight: "700",
  margin: "30px 0",
  padding: "0",
  lineHeight: "42px",
};

const heroText = {
  fontSize: "17px",
  lineHeight: "26px",
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
