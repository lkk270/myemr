"use server";

import * as z from "zod";
import { AuthError } from "next-auth";

import prismadb from "@/lib/prismadb";
import { signIn } from "@/auth";
import { LoginSchema } from "@/auth/schemas";
import { getUserByEmail } from "@/auth/data/user";
import { getTwoFactorTokenByEmail } from "@/auth/data/two-factor-token";
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "@/auth/lib/mail";
import { PATIENT_DEFAULT_LOGIN_REDIRECT, PROVIDER_DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { generateVerificationToken, generateTwoFactorToken } from "@/auth/lib/tokens";
import { getTwoFactorConfirmationByUserId } from "@/auth/data/two-factor-confirmation";
import { AccountType, UserType } from "@prisma/client";

export const login = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) => {
  console.log(" INE HERE");
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, userType, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email || "", values.userType);

  if (!existingUser || !existingUser.email) {
    return { error: "Email does not exist!" };
  }

  if (password && existingUser && !existingUser.password && existingUser.accountType === AccountType.OAUTH) {
    return { error: "Email is already being used through Google Sign in!" };
  }

  if (!password && existingUser && existingUser.password && existingUser.accountType === AccountType.CREDENTIALS) {
    return { error: "Email is already being used through email & password sign in!" };
  }
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(existingUser.email, userType);

    await sendVerificationEmail(verificationToken.email, verificationToken.token, userType);

    return { success: "Confirmation email sent!" };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email, userType);

      if (!twoFactorToken) {
        return { error: "Invalid code!" };
      }

      if (twoFactorToken.token !== code) {
        return { error: "Invalid code!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: "Code expired!" };
      }

      await prismadb.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

      if (existingConfirmation) {
        await prismadb.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await prismadb.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email, userType);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      userType,
      redirectTo: callbackUrl
        ? callbackUrl
        : userType === UserType.PATIENT
        ? PATIENT_DEFAULT_LOGIN_REDIRECT
        : PROVIDER_DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }
};
