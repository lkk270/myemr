import { UserType } from "@prisma/client";
import resendClient from "./resendClient";

const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resendClient.emails.send({
    from: "onboarding@resend.dev",
    to: email.toLowerCase(),
    subject: "2FA Code",
    html: `<p>Your 2FA code: ${token}</p>`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string, userType: UserType) => {
  const resetLink = `http://localhost:3000/auth/${userType.toLowerCase()}-new-password?token=${token}`;

  await resendClient.emails.send({
    from: "onboarding@resend.dev",
    to: email.toLowerCase(),
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`,
  });
};

export const sendVerificationEmail = async (email: string, token: string, userType: UserType) => {
  // const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  const confirmLink = `http://localhost:3000/auth/${userType.toLowerCase()}-new-verification?token=${token}`;
  console.log(confirmLink);
  await resendClient.emails.send({
    from: "onboarding@resend.dev",
    to: email.toLowerCase(),
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`,
  });
};

export const sendRequestRecordsEmail = async (email: string, token: string) => {
  // const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  const requestRecordsLink = `http://localhost:3000/request-records?token=${token}`;
  console.log(requestRecordsLink);
  await resendClient.emails.send({
    from: "onboarding@resend.dev",
    to: email.toLowerCase(),
    subject: "Request for records",
    html: `<p>Click <a href="${requestRecordsLink}">here</a> to upload patient's records.</p>`,
  });
};
