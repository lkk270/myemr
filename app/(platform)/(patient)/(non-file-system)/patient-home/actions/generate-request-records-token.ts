"use server";

import { v4 as uuidv4 } from "uuid";

import prismadb from "@/lib/prismadb";
import { getRequestRecordsTokenByEmail } from "@/auth/data";
import { sendRequestRecordsEmail } from "@/auth/lib/mail";
import { RequestRecordsSchema } from "../schemas";
import { z } from "zod";
import { currentUser } from "@/auth/lib/auth";
import { decryptKey, decryptMultiplePatientFields } from "@/lib/utils";
import { allotedPatientStoragesInGb } from "@/lib/constants";

export const generateRequestRecordsToken = async (values: z.infer<typeof RequestRecordsSchema>) => {
  const user = await currentUser();
  const userId = user?.id;
  const userEmail = user?.email;
  const isPatient = user?.role === "ADMIN" && user?.userType === "PATIENT";

  if (!user || !userId || !userEmail || !isPatient) {
    return { error: "Unauthorized" };
  }

  const validatedFields = RequestRecordsSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const patient = await prismadb.patientProfile.findUnique({
    where: {
      userId: userId,
    },
    select: {
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      symmetricKey: true,
      usedFileStorage: true,
      plan: true,
    },
  });
  if (!patient) {
    return { error: "Patient not found!" };
  }
  // const allotedStorageInGb = allotedPatientStoragesInGb[patient.plan];
  // if (BigInt(allotedStorageInGb * 1_000_000_000) - patient.usedFileStorage < 5_000_000) {
  //   return {
  //     error: "Cannot send a request for records, as it requires you to have 500 Mb of available storage.",
  //   };
  // }
  let decryptedPatientFields;
  try {
    const decryptedSymmetricKey = decryptKey(patient.symmetricKey, "patientSymmetricKey");
    decryptedPatientFields = decryptMultiplePatientFields(
      { firstName: patient.firstName, lastName: patient.lastName, dateOfBirth: patient.dateOfBirth },
      decryptedSymmetricKey,
    );
  } catch (e) {
    console.log(e);
    return { error: "Something went wrong" };
  }

  if (!decryptedPatientFields.dateOfBirth) {
    return { error: "You must select your date of birth in the About page before requesting your records." };
  }
  const { providerEmail, signature, uploadToId } = validatedFields.data;

  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 2_592_000 * 1000);

  const existingToken = await getRequestRecordsTokenByEmail(providerEmail, userId);

  if (existingToken) {
    return { error: "You have already sent a request to this provider that has not yet expired." };
  }

  const dataForLetter = {
    signature,
    expires,
    email: userEmail,
    dateOfBirth: decryptedPatientFields.dateOfBirth,
    firstName: decryptedPatientFields.firstName,
    lastName: decryptedPatientFields.lastName,
  };

  const requestRecordsToken = await prismadb.requestRecordsCode.create({
    data: {
      userId,
      parentFolderId: uploadToId,
      providerEmail: providerEmail.toLowerCase(),
      token,
      expires,
    },
  });

  try {
    await sendRequestRecordsEmail(providerEmail, requestRecordsToken.token, dataForLetter);
    return { success: "Email sent!" };
  } catch (error) {
    console.log(error);
    return { error: "Something wrong" };
  }
};
