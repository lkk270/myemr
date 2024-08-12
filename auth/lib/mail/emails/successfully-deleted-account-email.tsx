import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import * as React from "react";

interface SuccessfullyDeletedAccountEmailProps {
  email: string;
  accountType: "Patient" | "Provider";
}

export const SuccessfullyDeletedAccountEmail = ({ email, accountType }: SuccessfullyDeletedAccountEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>MyEmr Account Deleted Successfully</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[700px]">
            <Section className="mt-[32px]">
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  textAlign: "center",
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
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              MyEmr Account Deleted Successfully
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">Dear {email},</Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Your MyEmr {accountType} account has been successfully deleted
              {accountType === "Patient"
                ? ` , along with all associated records, which
              have been permanently removed. `
                : ". "}
              Should you decide to return to MyEmr, you are welcome to create a new {accountType} account using the same
              email address. We regret your departure and would be pleased to serve you again in the future
            </Text>
            {accountType === "Patient" && (
              <Text className="text-[#666666] text-[12px] leading-[24px]">
                The deletion process complies with HIPAA regulations, guaranteeing the safeguarding of patient privacy
                and confidentiality.
              </Text>
            )}
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Please refrain from replying to this email, as it is sent from an unmonitored inbox. Should you need to
              get in touch with MyEmr, kindly reach out to us via email at support@myemr.io.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Section className="text-[#bdbdbd] text-[12px]">
              <Link href="https://myemr.io" target="_blank" rel="noopener noreferrer" className="underline">
                myemr © 2024
              </Link>
              <span>{" | All rights reserved"}</span>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
