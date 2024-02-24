import { UserType } from "@prisma/client";
import resendClient from "./resendClient";
import { getBuffer, logoBase64Url } from "./notarized-letter";
import { RequestRecordsEmail } from "./request-records-email";
import prismadb from "@/lib/prismadb";
const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const response = await resendClient.emails.send({
    from: "onboarding@resend.dev",
    to: email.toLowerCase(),
    subject: "2FA Code",
    html: `<p>Your 2FA code: ${token}</p>`,
  });
  if (response.error) {
    throw new Error("Something went wrong on email send");
  }
};

export const sendPasswordResetEmail = async (email: string, token: string, userType: UserType) => {
  const resetLink = `http://localhost:3000/auth/${userType.toLowerCase()}-new-password?token=${token}`;

  const response = await resendClient.emails.send({
    from: "onboarding@resend.dev",
    to: email.toLowerCase(),
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`,
  });
  if (response.error) {
    throw new Error("Something went wrong on email send");
  }
};

export const sendVerificationEmail = async (email: string, token: string, userType: UserType) => {
  // const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  const confirmLink = `http://localhost:3000/auth/${userType.toLowerCase()}-new-verification?token=${token}`;
  console.log(confirmLink);
  const response = await resendClient.emails.send({
    from: "onboarding@resend.dev",
    to: email.toLowerCase(),
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`,
  });
  if (response.error) {
    throw new Error("Something went wrong on email send");
  }
};

export const sendRequestRecordsEmail = async (
  providerEmail: string,
  token: string,
  dataForLetter: {
    signature: string;
    email: string;
    dateOfBirth: string;
    expires: Date;
    firstName: string;
    lastName: string;
  },
) => {
  // const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  const requestRecordsLink = `http://localhost:3000/request-records?token=${token}`;
  let buffer = null;
  try {
    buffer = await getBuffer({ data: { ...dataForLetter, requestRecordsLink } });
  } catch {
    throw new Error("Something went wrong on email send");
  }
  if (!buffer) {
    throw new Error("Something went wrong on email send");
  }
  const response = await resendClient.emails.send({
    from: "onboarding@resend.dev",
    to: "leekk270@gmail.com",
    cc: dataForLetter.email,
    subject: "Request for records",
    attachments: [{ filename: "letter.pdf", content: buffer }],
    react: RequestRecordsEmail({ dataForLetter: dataForLetter, requestRecordsLink: requestRecordsLink }),
    // html: `
    // <div style="font-size: 14px; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #333;">
    //     <div style="text-align: center; margin-bottom: 20px;">
    //         <img src="${logoBase64Url}" alt="MyEmr Logo" style="width: 100px; height: auto;">
    //         <h2 style="font-size: 24px; font-weight: bold;">MyEmr</h2>
    //     </div>
    //     <div>
    //     <p>Dear Provider,</p>
    //     <p>This letter, sent by your patient ${dataForLetter.firstName} ${dataForLetter.lastName} (DOB ${dataForLetter.dateOfBirth}) through their MyEmr account, is a formal request for their medical records. Attached, you will find a notarized document that provides further details and ensures the legitimacy of the request on the patient's behalf. Please save the notarized document in your records.</p>
    //     <p>Please <a href="${requestRecordsLink}">click here</a> to upload the patient's records. The link is valid for 30 days from the delivery of this email. It's important to ensure that ALL records in your possession for
    //     the patient in question are uploaded and that they are accurate & up-to-date for compliance and continuity of
    //     care.</p>
    //     <p>If you have any questions, require further information, or believe this request is a mistake,
    //     please do not hesitate to contact me [the patient] at ${dataForLetter.email} or MyEmr at
    //     support@myemr.io.</p>
    //     <p>Thank you in advance for your compliance of the patient's request.</p>
    //     <p>Sincerely,</p>
    //     <p>The MyEmr Team</p>
    //     </div>
    // </div>
    // `,
  });
  if (response.error) {
    console.log(response);
    // await prismadb.requestRecordsToken.delete({
    //   where: {
    //     token,
    //   },
    // });
    throw new Error("Something went wrong on email send");
  }
};
