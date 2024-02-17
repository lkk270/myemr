"use server";

import * as z from "zod";
import prismadb from "@/lib/prismadb";
import { currentUser } from "@/auth/lib/auth";
import { GenerateCodeSchema } from "../schemas";
import { generateAccessCode } from "@/lib/actions/access-codes";
import { AccessCodeValidTime, UserType } from "@prisma/client";

export const accessCode = async (values: z.infer<typeof GenerateCodeSchema>) => {
  const user = await currentUser();
  const userId = user?.id;

  if (!user || !userId) {
    return { error: "Unauthorized" };
  }

  const patient = await prismadb.patientProfile.findUnique({
    where: {
      userId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!patient) {
    return { error: "Unauthorized" };
  }
  const validatedFields = GenerateCodeSchema.safeParse(values);

  if (!validatedFields.success) {
    console.log("IN HERE ERRROR");
    return { error: "Invalid fields!" };
  }

  const { validFor, accessType } = validatedFields.data;

  if (!validFor || !accessType || (accessType === "UPLOAD_FILES_ONLY" && !values.uploadToId)) {
    return { error: "Invalid body" };
  }

  const accessCode = await generateAccessCode(patient.id, userId, validFor, accessType);

  return { success: "Confirmation email sent!", code: accessCode.token };
};
