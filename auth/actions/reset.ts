"use server";

import * as z from "zod";

import { ResetSchema } from "@/auth/schemas";
import { getUserByEmail } from "@/auth/data/user";
import { sendPasswordResetEmail } from "@/auth/lib/mail/mail";
import { generatePasswordResetToken } from "@/auth/lib/tokens";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid emaiL!" };
  }

  const { email, userType } = validatedFields.data;

  const existingUser = await getUserByEmail(email, userType);

  if (!existingUser) {
    return { error: "Email not found!" };
  }

  const passwordResetToken = await generatePasswordResetToken(email, userType);
  await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token, userType);

  return { success: "Reset email sent!" };
};
