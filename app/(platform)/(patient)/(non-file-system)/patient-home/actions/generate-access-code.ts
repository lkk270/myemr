"use server";

import * as z from "zod";
import prismadb from "@/lib/prismadb";
import { currentUser } from "@/auth/lib/auth";
import { GenerateCodeSchema } from "../schemas";
import { generateAccessCode } from "@/lib/actions/access-codes";
import { allotedStoragesInGb } from "@/lib/constants";

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
      usedFileStorage: true,
      plan: true,
    },
  });

  if (!patient) {
    return { error: "Unauthorized" };
  }
  const validatedFields = GenerateCodeSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { validFor, accessType, uploadToId } = validatedFields.data;

  if (!validFor || !accessType || (accessType === "UPLOAD_FILES_ONLY" && !values.uploadToId)) {
    return { error: "Invalid body" };
  }

  const allotedStorageInGb = allotedStoragesInGb[user.plan];
  if (accessType !== "READ_ONLY" && BigInt(allotedStorageInGb * 1_000_000_000) - patient.usedFileStorage < 5_000_000) {
    return {
      error:
        "Cannot generate a code for the selected access type because it requires you to have 500 Mb of available storage.",
    };
  }
  const accessCode = await generateAccessCode(patient.id, validFor, accessType, uploadToId);
  if (accessCode) {
    return { success: "Confirmation email sent!", code: accessCode.token };
  } else {
    return { error: "Unauthorized" };
  }
};
