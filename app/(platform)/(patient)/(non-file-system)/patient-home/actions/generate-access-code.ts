"use server";

import * as z from "zod";
import prismadb from "@/lib/prismadb";
import { currentUser } from "@/auth/lib/auth";
import { GenerateCodeSchema } from "../schemas";
import { generateAccessCode } from "@/lib/actions/access-codes";

export const accessCode = async (values: z.infer<typeof GenerateCodeSchema>) => {
  const user = await currentUser();
  const userId = user?.id;
  const isPatient = user?.role === "ADMIN" && user?.userType === "PATIENT";

  if (!user || !userId || !isPatient) {
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
    return { error: "Invalid fields!" };
  }

  const { validFor, accessType } = validatedFields.data;

  if (!validFor || !accessType || (accessType === "UPLOAD_FILES_ONLY" && !values.uploadToId)) {
    return { error: "Invalid body" };
  }

  const accessCode = await generateAccessCode(patient.id, validFor, accessType);
  if (accessCode) {
    return { success: "Confirmation email sent!", code: accessCode.token };
  } else {
    return { error: "Unauthorized" };
  }
};
