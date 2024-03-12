"use server";

import prismadb from "@/lib/prismadb";
import { getUserByEmail } from "@/auth/data/user";
import { getVerificationTokenByToken } from "@/auth/data/verification-token";
import { UserType } from "@prisma/client";

export const newVerification = async (token: string, userType: UserType) => {
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.email, userType);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  await prismadb.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      email: existingToken.email,
    },
  });

  await prismadb.verificationToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Email verified!" };
};
