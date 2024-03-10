"use server";

import { z } from "zod";
import prismadb from "@/lib/prismadb";
import { EditMedicationSchema, NewMedicationSchema, DeleteMedicationSchema } from "../schemas/medication";
import { createNotification } from "./notifications";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { decryptMultiplePatientFields, buildUpdatePayload, decryptKey, findChangesBetweenObjects } from "../utils";
import { auth } from "@/auth";
import { getAccessPatientCodeByToken } from "@/auth/data";

export const createMedication = async (values: z.infer<typeof NewMedicationSchema>) => {
  try {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    const currentUserPermissions = extractCurrentUserPermissions(user);

    if (!session || !userId || !user || !currentUserPermissions.canEdit) {
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

export const editMedication = async (values: z.infer<typeof EditMedicationSchema>) => {
  try {
    let newDosageHistory = null;
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
        symmetricKey: true,
        unrestrictedUsedFileStorage: true,
      },
    });
    if (!patient || !patient.symmetricKey) {
      return { error: "Decryption key not found!" };
    }
    const decryptedSymmetricKey = decryptKey(patient.symmetricKey, "patientSymmetricKey");

    const validatedFields = EditMedicationSchema.safeParse(values);
    // const session = await auth();
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    const { id } = validatedFields.data;

    const currentMedication = await prismadb.medication.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        dosage: true,
        frequency: true,
        dosageUnits: true,
        status: true,
        prescribedByName: true,
        category: true,
        prescribedById: true,
        description: true,
        createdAt: true,
      },
    });
    if (!currentMedication) {
      return { error: "Medication not found!" };
    }

    const decryptedCurrentMedication = decryptMultiplePatientFields(currentMedication, decryptedSymmetricKey);

    const changesObject = findChangesBetweenObjects(decryptedCurrentMedication, validatedFields.data);
    if (Object.keys(changesObject).length === 0) {
      return { error: "No changes made!" };
    }
    const updatePayload = buildUpdatePayload(changesObject, decryptedSymmetricKey);
    await prismadb.medication.update({
      where: { id: id },
      data: updatePayload,
    });

    if (changesObject.dosage || changesObject.dosageUnits || changesObject.frequency) {
      const dosageHistoryInitialFields = {
        dosage: decryptedCurrentMedication.dosage,
        dosageUnits: decryptedCurrentMedication.dosageUnits,
        frequency: decryptedCurrentMedication.frequency,
      };
      const dosageHistoryEntry = buildUpdatePayload(dosageHistoryInitialFields, decryptedSymmetricKey);
      const newDosageHistoryDb = await prismadb.dosageHistory.create({
        data: { ...dosageHistoryEntry, ...{ medicationId: currentMedication.id } },
      });

      newDosageHistory = {
        ...dosageHistoryInitialFields,
        id: newDosageHistoryDb.id,
        medicationId: newDosageHistoryDb.medicationId,
        createdAt: newDosageHistoryDb.createdAt,
      };
    }
    if (!currentUserPermissions.hasAccount) {
      await createNotification({
        text: `An external user, whom you granted a temporary access code with "${user?.role}" permissions has updated the medication: "${currentMedication.name}"`,
        type: "ACCESS_CODE",
      });
    }

    return {
      success: "Medication updated!",
      medicationName: decryptedCurrentMedication.name,
      newDosageHistory: newDosageHistory,
      createdAt: currentMedication.createdAt,
    };
  } catch {
    return { error: "something went wrong" };
  }
};

export const deleteMedication = async (values: z.infer<typeof DeleteMedicationSchema>) => {
  try {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    const currentUserPermissions = extractCurrentUserPermissions(user);

    if (!session || !userId || !user || !currentUserPermissions.canDelete) {
      return { error: "Unauthorized" };
    }

    const validatedFields = DeleteMedicationSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    const { id } = validatedFields.data;

    await prismadb.medication.delete({
      where: { id },
    });

    return {
      success: "Medication deleted!",
    };
  } catch {
    return { error: "something went wrong" };
  }
};
