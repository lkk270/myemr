import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import * as React from "react";

interface RequestRecordsEmailProps {
  dataForLetter: {
    signature: string;
    providerEmail: string;
    email: string;
    dateOfBirth: string;
    expires: Date;
    firstName: string;
    lastName: string;
  };
  requestRecordsLink: string;
}

export const RequestRecordsEmail = ({ dataForLetter, requestRecordsLink }: RequestRecordsEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Request for Medical Records</Preview>
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
                  src="https://res.cloudinary.com/ddr7l73bu/image/upload/v1708784793/logo_wuhwbw.png"
                  alt="MyEmr Logo"
                  style={{ width: "42px", height: "42px", verticalAlign: "middle" }}
                />
                <span style={{ lineHeight: "42px", verticalAlign: "middle", paddingLeft: "4px" }}>MyEMR</span>
              </div>
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Request for Medical Records
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">To whom it may concern,</Text>
            <Text className="text-black text-[14px] leading-[24px]">
              This letter, sent by your patient {dataForLetter.firstName} {dataForLetter.lastName} (DOB{" "}
              {dataForLetter.dateOfBirth}) through their MyEmr account, is a formal request for their medical records.
              Attached, you will find a notarized document that provides further details and ensures the legitimacy and
              HIPAA compliance of the request on the patient's behalf. Please save the notarized document in your
              records.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Use the upload button or link (found below or in the attached pdf) to upload the patient's records. The
              link is valid for 30 days from the delivery of this email. It's important to ensure that ALL records in
              your possession for the patient in question are uploaded and that they are accurate & up-to-date for
              compliance and continuity of care.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={requestRecordsLink}
              >
                Click here to upload
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{" "}
              <Link href={requestRecordsLink} className="text-blue-600 no-underline">
                {requestRecordsLink}
              </Link>
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              If you have any questions, require further information, or believe this request is a mistake, please do
              not hesitate to contact me [the patient] directly at {dataForLetter.email} or simply respond to this email
              since I [the patient] am CCed.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Thank you in advance for your compliance with the patient's request.
              <Text className="text-black text-[14px] leading-[24px]">Sincerely,</Text>
              <Text className="text-black text-[14px] leading-[24px]">The MyEmr Team</Text>
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This request is intended for <span className="text-black">{dataForLetter.providerEmail}</span>. This
              request was sent from the MyEmr account of patient: {dataForLetter.firstName} {dataForLetter.lastName}{" "}
              (DOB {dataForLetter.dateOfBirth}), email: {dataForLetter.email}. As stated if you have any questions,
              please reply to this email to get in touch with us and/or the patient.
            </Text>
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This process, including the request for and subsequent uploading of the patient's medical records, adheres
              to HIPAA regulations to ensure the protection of patient privacy and confidentiality.
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
