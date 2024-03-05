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
    },
  });

  if (!patient) {
    return { error: "Unauthorized" };
  }
  const validatedFields = GenerateCodeSchema.safeParse(values);

  if (!validatedFields.success || !validatedFields.data.accessType) {
    return { error: "Invalid fields!" };
  }

  const { validFor, accessType, uploadToId } = validatedFields.data;

  if (!validFor || !accessType || (accessType === "UPLOAD_FILES_ONLY" && !values.uploadToId)) {
    return { error: "Invalid body" };
  }

  if ((accessType === "FULL_ACCESS" || accessType === "READ_AND_ADD") && (!user.plan || user.plan.includes("_FREE"))) {
    return {
      error:
        "We're unable to generate a code for the selected access type. To proceed, please upgrade to our Pro or Pro+ plan.",
    };
  }
  const allotedStorageInGb = allotedStoragesInGb[user.plan];
  if (accessType !== "READ_ONLY" && BigInt(allotedStorageInGb * 1_000_000_000) - patient.usedFileStorage < 5_000_000) {
    return {
      error:
        "We're unable to generate a code for the selected access type because it requires you to have 500 Mb of available storage.",
    };
  }
  const accessCode = await generateAccessCode(patient.id, validFor, accessType, uploadToId);
  if (accessCode) {
    return { success: "Confirmation email sent!", code: accessCode.token };
  } else {
    return { error: "Unauthorized" };
  }
};
