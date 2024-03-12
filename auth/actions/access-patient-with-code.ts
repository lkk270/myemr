"use server";

import * as z from "zod";
import { AuthError } from "next-auth";

import prismadb from "@/lib/prismadb";
import { signIn } from "@/auth";
import { AccessPatientWithCodeSchema } from "@/auth/schemas";
import { getUserByEmail } from "@/auth/data/user";
import { ACCESS_PATIENT_WITH_CODE_REDIRECT } from "@/routes";
import { AccountType, UserType } from "@prisma/client";

export const accessPatientWithCode = async (
  values: z.infer<typeof AccessPatientWithCodeSchema>,
  callbackUrl?: string | null,
) => {
  console.log(" INE HERE");
  const validatedFields = AccessPatientWithCodeSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { code } = validatedFields.data;

  //   const existingUser = await getUserByEmail(email || "", values.userType);

  //   if (!existingUser || !existingUser.email) {
  //     return { error: "Email does not exist!" };
  //   }

  //   if (password && existingUser && !existingUser.password && existingUser.accountType === AccountType.OAUTH) {
  //     return { error: "Email is already being used through Google Sign in!" };
  //   }

  try {
    await signIn("credentials", {
      code,
      redirectTo: ACCESS_PATIENT_WITH_CODE_REDIRECT,
    });
  } catch (error) {
    // console.log(error);
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
