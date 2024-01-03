import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

import prismadb from "@/lib/prismadb";
import { getVerificationTokenByEmail } from "../data/verificiation-token";
import { getPasswordResetTokenByEmail } from "../data/password-reset-token";
import { getTwoFactorTokenByEmail } from "../data/two-factor-token";
import { UserType } from "@prisma/client";

export const generateTwoFactorToken = async (email: string, userType: UserType) => {
  const token = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000);

  const existingToken = await getTwoFactorTokenByEmail(email, userType);

  if (existingToken) {
    await prismadb.twoFactorToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const twoFactorToken = await prismadb.twoFactorToken.create({
    data: {
      userType,
      email: email.toLowerCase(),
      token,
      expires,
    },
  });

  return twoFactorToken;
};

export const generatePasswordResetToken = async (email: string, userType: UserType) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordResetTokenByEmail(email, userType);

  if (existingToken) {
    await prismadb.passwordResetToken.delete({
      where: { id: existingToken.id },
    });
  }

  const passwordResetToken = await prismadb.passwordResetToken.create({
    data: {
      userType,
      email: email.toLowerCase(),
      token,
      expires,
    },
  });

  return passwordResetToken;
};

export const generateVerificationToken = async (email: string, userType: UserType) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getVerificationTokenByEmail(email, userType);

  if (existingToken) {
    await prismadb.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const verificationToken = await prismadb.verificationToken.create({
    data: {
      userType,
      email: email.toLowerCase(),
      token,
      expires,
    },
  });

  return verificationToken;
};
