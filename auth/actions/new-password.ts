"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { NewPasswordSchema } from "@/auth/schemas";
import { getPasswordResetTokenByToken } from "@/auth/data/password-reset-token";
import { getUserByEmail } from "@/auth/data/user";
import prismadb from "@/lib/prismadb";

export const newPassword = async (values: z.infer<typeof NewPasswordSchema>, token?: string | null) => {
  if (!token) {
    return { error: "Missing token!" };
  }

  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { password, userType } = validatedFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Invalid token!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.email, userType);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prismadb.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  await prismadb.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Password updated!" };
};
