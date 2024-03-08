"use server";

import { z } from "zod";
import prismadb from "@/lib/prismadb";
import { NewMedicationSchema } from "../schemas/medication";
import { createNotification } from "./notifications";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { decryptMultiplePatientFields, buildUpdatePayload, decryptKey } from "../utils";
import { auth } from "@/auth";

export const createMedication = async (values: z.infer<typeof NewMedicationSchema>) => {
  try {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    const currentUserPermissions = extractCurrentUserPermissions(user);

    if (!userId || !user || !currentUserPermissions.canAdd) {
      return { error: "Unauthorized" };
    }

    const patient = await prismadb.patientProfile.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        symmetricKey: true,
        unrestrictedUsedFileStorage: true,
      },
    });
    if (!patient || !patient.symmetricKey) {
      return { error: "Decryption key not found!" };
    }
    const decryptedSymmetricKey = decryptKey(patient.symmetricKey, "patientSymmetricKey");

    const validatedFields = NewMedicationSchema.safeParse(values);
    // const session = await auth();
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    const { name } = validatedFields.data;

    const currentMedicationNames = await prismadb.medication.findMany({
      where: {
        patientProfileId: patient.id,
      },
      select: {
        name: true,
      },
    });
    const decryptedCurrentMedicationNames = decryptMultiplePatientFields(currentMedicationNames, decryptedSymmetricKey);

    if (decryptedCurrentMedicationNames.some((medication: { name: string }) => medication.name === name)) {
      return { error: "Medication already exists" };
    }
    const encryptedMedication = buildUpdatePayload(validatedFields.data, decryptedSymmetricKey);

    const newMedication = await prismadb.medication.create({
      data: { ...encryptedMedication, ...{ patientProfileId: patient.id } },
    });

    if (!currentUserPermissions.hasAccount) {
      await createNotification({
        text: `An external user, whom you granted a temporary access code with "${user?.role}" permissions has added the medication: "${name}"`,
        type: "ACCESS_CODE",
      });
    }

    return { success: "medication created!", medicationId: newMedication.id };
  } catch {
    return { error: "something went wrong" };
  }
};
