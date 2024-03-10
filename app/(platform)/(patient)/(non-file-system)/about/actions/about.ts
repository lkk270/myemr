"use server";

import { z } from "zod";
import prismadb from "@/lib/prismadb";
import { PersonalInformationSchema } from "../schemas/about";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { decryptMultiplePatientFields, buildUpdatePayload, decryptKey, findChangesBetweenObjects } from "@/lib/utils";
import { auth } from "@/auth";
import { getAccessPatientCodeByToken } from "@/auth/data";

export const editPersonalInformation = async (values: z.infer<typeof PersonalInformationSchema>) => {
  try {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    const currentUserPermissions = extractCurrentUserPermissions(user);

    if (!session || !userId || !user || !currentUserPermissions.canAdd) {
      return { error: "Unauthorized" };
    }
    if (!currentUserPermissions.isPatient) {
      const code = await getAccessPatientCodeByToken(session.tempToken);
      if (!code) {
        return { error: "Unauthorized" };
      }
    }

    const patient = await prismadb.patientProfile.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        race: true,
        maritalStatus: true,
        weight: true,
        height: true,
        symmetricKey: true,
      },
    });
    if (!patient || !patient.symmetricKey) {
      return { error: "Decryption key not found!" };
    }
    const decryptedSymmetricKey = decryptKey(patient.symmetricKey, "patientSymmetricKey");

    const validatedFields = PersonalInformationSchema.safeParse(values);
    // const session = await auth();
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const decryptedPersonalInformation = decryptMultiplePatientFields(patient, decryptedSymmetricKey);

    const changesObject = findChangesBetweenObjects(decryptedPersonalInformation, validatedFields.data);
    if (Object.keys(changesObject).length === 0) {
      return { error: "No changes made!" };
    }
    const updatePayload = buildUpdatePayload(changesObject, decryptedSymmetricKey);

    if (Object.keys(updatePayload).length > 0) {
      await prismadb.patientProfile.update({
        where: { id: patient.id },
        data: updatePayload,
      });
    }

    return {
      success: "Personal Information updated!",
    };
  } catch {
    return { error: "something went wrong" };
  }
};
