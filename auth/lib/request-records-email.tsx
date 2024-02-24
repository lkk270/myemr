import React from "react";
import { Logo } from "@/components/logo";

interface RequestRecordsEmailProps {
  dataForLetter: {
    signature: string;
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
    <div
      className="font-sans text-gray-800"
      style={{ fontSize: "15px", padding: "4px", borderBottom: "1px solid #000" }}
    >
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

      <div>
        <p>Dear Provider,</p>
        <p>
          This letter, sent by your patient {dataForLetter.firstName} {dataForLetter.lastName} (DOB{" "}
          {dataForLetter.dateOfBirth}) through their MyEmr account, is a formal request for their medical records.
          Attached, you will find a notarized document that provides further details and ensures the legitimacy of the
          request on the patient's behalf. Please save the notarized document in your records.
        </p>
        <p>
          Please{" "}
          <a href={requestRecordsLink} className="text-blue-500 underline">
            click here
          </a>{" "}
          to upload the patient's records. The link is valid for 30 days from the delivery of this email. It's important
          to ensure that ALL records in your possession for the patient in question are uploaded and that they are
          accurate & up-to-date for compliance and continuity of care.
        </p>
        <p>
          If you have any questions, require further information, or believe this request is a mistake, please do not
          hesitate to contact me [the patient] directly at {dataForLetter.email} or simply respond to this email since I
          [the patient] am CCed.
        </p>
        <p>Thank you in advance for your compliance with the patient's request.</p>
        <p>Sincerely,</p>
        <p>The MyEmr Team</p>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px", padding: "10px", borderTop: "1px solid #000" }}>
        <a style={{ color: "#4f5eff" }} className="underline" href="mymer.io">
          myemr © 2024
        </a>
      </div>
    </div>
  );
};
