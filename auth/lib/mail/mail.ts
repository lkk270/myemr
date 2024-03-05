"use server";

import { UserType } from "@prisma/client";
import resendClient from "./resendClient";
import { getBuffer } from "./pdfs/notarized-letter";
import { RequestRecordsEmail, TwoFactorConfirmationEmail, MagicLinkEmail } from "./emails";

const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const response = await resendClient.emails.send({
    from: "onboarding@resend.dev",
    to: email.toLowerCase(),
    subject: "2FA Code",
    react: TwoFactorConfirmationEmail({ verificationToken: token }),
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
    react: MagicLinkEmail({ magicLink: resetLink, type: "passwordReset" }),
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
    react: MagicLinkEmail({ magicLink: confirmLink, type: "emailConfirmation" }),
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
  const requestRecordsLink = `http://localhost:3000/upload-records/${token}`;
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
    attachments: [
      {
        filename: `request_for_records_${dataForLetter.firstName.toLowerCase()}_${dataForLetter.lastName.toLowerCase()}.pdf`,
        content: buffer,
      },
    ],
    react: RequestRecordsEmail({
      dataForLetter: { ...dataForLetter, providerEmail },
      requestRecordsLink: requestRecordsLink,
    }),
  });
  if (response.error) {
    console.log(response);
    // await prismadb.requestRecordsCode.delete({
    //   where: {
    //     token,
    //   },
    // });
    throw new Error("Something went wrong on email send");
  }
};

export const sendFeedback = async (text: string) => {
  const response = await resendClient.emails.send({
    from: "onboarding@resend.dev",
    to: "leekk270@gmail.com",
    subject: "Feedback",
    html: `<div><p>Here's some feedback</p><p>${text}</p></div>`,
  });

  if (response.error) {
    throw new Error("Something went wrong on email send");
  }
};
