"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { update } from "@/auth";
import prismadb from "@/lib/prismadb";
import { SettingsSchema } from "@/auth/schemas";
import { getUserByEmail, getUserById } from "@/auth/data/user";
import { currentUser } from "@/auth/lib/auth";
import { generateVerificationToken } from "@/auth/lib/tokens";
import { sendVerificationEmail } from "@/auth/lib/mail/mail";
import { findChangesBetweenObjects } from "@/lib/utils";

function filterFields(originalObject: any) {
  const fields = ["role", "isTwoFactorEnabled", "name"];
  let filteredObject: any = {};
  fields.forEach((field) => {
    if (originalObject.hasOwnProperty(field)) {
      filteredObject[field] = originalObject[field];
    }
  });
  return filteredObject;
}

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const user = await currentUser();

  if (!user || !user.id) {
    return { error: "Unauthorized" };
  }
  const dbUser = await getUserById(user.id);

  if (!dbUser) {
    return { error: "Unauthorized" };
  }

  if (user.isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined;
  }

  if (values.email && values.email !== user.email) {
    const existingUser = await getUserByEmail(values.email, values.userType);

    if (existingUser && existingUser.id !== user.id) {
      return { error: "Email already in use!" };
    }

    const verificationToken = await generateVerificationToken(values.email, values.userType);
    await sendVerificationEmail(verificationToken.email, verificationToken.token, values.userType);

    return { success: "Verification email sent!" };
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordsMatch = await bcrypt.compare(values.password, dbUser.password);

    if (!passwordsMatch) {
      return { error: "Incorrect password!" };
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);
    values.password = hashedPassword;
    values.newPassword = undefined;
  }

  const dataToUse: any = {
    isTwoFactorEnabled: values.isTwoFactorEnabled,
    password: values.password,
  };

  if (dbUser.type === "PROVIDER") {
    dataToUse.name = values.name;
  }

  const updatedData = findChangesBetweenObjects(dbUser, dataToUse);
  const updatedUserObject = filterFields(updatedData);
  await prismadb.user.update({
    where: { id: dbUser.id },
    data: updatedData,
  });

  update({
    user: updatedUserObject,
  });

  return { success: "Settings Updated!" };
};
