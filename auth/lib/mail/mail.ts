"use server";

import { UserType } from "@prisma/client";
import resendClient from "./resendClient";
import { getBuffer } from "./pdfs/notarized-letter";
import {
  InvitedToOrganizationEmailNoAccount,
  InvitedToOrganizationEmailHasAccount,
  MagicLinkEmail,
  RequestRecordsEmail,
  SuccessfullyDeletedAccountEmail,
  TwoFactorConfirmationEmail,
} from "./emails";

const domain = process.env.NEXT_PUBLIC_URL;

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const response = await resendClient.emails.send({
    from: "no-reply@myemr.io",
    to: email,
    subject: "2FA Code",
    react: TwoFactorConfirmationEmail({ verificationToken: token }),
  });
  if (response.error) {
    throw new Error("Something went wrong on email send");
  }
};

export const sendSuccessfullyDeletedAccountEmail = async (email: string, accountType: "Patient" | "Provider") => {
  const response = await resendClient.emails.send({
    from: "no-reply@myemr.io",
    to: email,
    subject: `MyEmr ${accountType} Successfully Deleted`,
    react: SuccessfullyDeletedAccountEmail({ email, accountType }),
  });
  if (response.error) {
    throw new Error("Something went wrong on email send");
  }
};

export const sendPasswordResetEmail = async (email: string, token: string, userType: UserType) => {
  const resetLink = `${domain}/auth/${userType.toLowerCase()}-new-password?token=${token}`;

  const response = await resendClient.emails.send({
    from: "no-reply@myemr.io",
    to: email,
    subject: "Reset your password",
    react: MagicLinkEmail({ magicLink: resetLink, type: "passwordReset" }),
  });
  if (response.error) {
    throw new Error("Something went wrong on email send");
  }
};

export const sendVerificationEmail = async (email: string, token: string, userType: UserType) => {
  // const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  const confirmLink = `${domain}/auth/${userType.toLowerCase()}-new-verification?token=${token}`;
  const response = await resendClient.emails.send({
    from: "no-reply@myemr.io",
    to: email,
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
  const requestRecordsLink = `${domain}/upload-records/${token}`;
  let buffer = null;
  try {
    buffer = await getBuffer({ data: { ...dataForLetter, requestRecordsLink } });
  } catch (e) {
    // console.log("In 87");
    console.log(e);
    throw new Error("Something went wrong on email send");
  }
  if (!buffer) {
    // console.log("NO BUFFER");
    throw new Error("Something went wrong on email send");
  }
  const response = await resendClient.emails.send({
    from: "records-request@myemr.io",
    to: providerEmail,
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
    // await prismadb.requestRecordsCode.delete({
    //   where: {
    //     token,
    //   },
    // });
    // console.log("IN 117");
    // console.log(response);
    throw new Error("Something went wrong on email send");
  }
};

export const sendFeedback = async (text: string) => {
  const response = await resendClient.emails.send({
    from: "no-reply@myemr.io",
    to: "leekk270@gmail.com",
    subject: "Feedback",
    html: `<div><p>Here's some feedback</p><p>${text}</p></div>`,
  });

  if (response.error) {
    throw new Error("Something went wrong on email send");
  }
};

export const sendInvitedToOrganizationEmailNoAccount = async (
  email: string,
  token: string,
  organizationName: string,
) => {
  const response = await resendClient.emails.send({
    from: "no-reply@myemr.io",
    to: email,
    subject: "You've Been Invited to Join a MyEmr Organization",
    react: InvitedToOrganizationEmailNoAccount({ inviteToken: token, organizationName }),
  });
  if (response.error) {
    throw new Error("Something went wrong on email send");
  }
};

export const sendInvitedToOrganizationEmailHasAccount = async (
  email: string,
  organizationId: string,
  organizationName: string,
) => {
  const response = await resendClient.emails.send({
    from: "no-reply@myemr.io",
    to: email,
    subject: "You've Been Added to a MyEmr Organization",
    react: InvitedToOrganizationEmailHasAccount({ organizationId, organizationName }),
  });
  if (response.error) {
    throw new Error("Something went wrong on email send");
  }
};
