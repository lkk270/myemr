"use server";

import { z } from "zod";
import prismadb from "@/lib/prismadb";
import { EditMedicationSchema, NewMedicationSchema, DeleteMedicationSchema } from "../schemas/medication";
import { createPatientNotification } from "./notifications";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { decryptMultiplePatientFields, buildUpdatePayload, decryptKey, findChangesBetweenObjects } from "../utils";
import { auth } from "@/auth";
import { getAccessPatientCodeByToken } from "@/auth/data";
import { getPatientMember } from "@/auth/actions/patient-member";

export const createMedication = async (values: z.infer<typeof NewMedicationSchema>) => {
  try {
    const validatedFields = NewMedicationSchema.safeParse(values);
    // const session = await auth();
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    const { name, patientMemberId: patientMemberIdParam } = validatedFields.data;
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    const currentUserPermissions = extractCurrentUserPermissions(user);
    let patientMember = null;
    if (!session || !userId || !user || (!currentUserPermissions.isProvider && !currentUserPermissions.canAdd)) {
      return { error: "Unauthorized" };
    }

    if (!!patientMemberIdParam && currentUserPermissions.isProvider) {
      patientMember = await getPatientMember(patientMemberIdParam, "canAdd", { user, currentUserPermissions });
    } else if (!currentUserPermissions.isProvider && !currentUserPermissions.isPatient) {
      const code = await getAccessPatientCodeByToken(session.tempToken);
      if (!code) {
        return { error: "Unauthorized" };
      }
    }

    const whereClause = !!patientMember?.patientProfileId
      ? {
          id: patientMember?.patientProfileId,
        }
      : {
          userId: userId,
        };

    const patient = await prismadb.patientProfile.findUnique({
      where: whereClause,
      select: {
        id: true,
        symmetricKey: true,
      },
    });

    if (!patient || !patient.symmetricKey) {
      return { error: "Decryption key not found!" };
    }
    const decryptedSymmetricKey = decryptKey(patient.symmetricKey, "patientSymmetricKey");

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
    const { patientMemberId, ...rest } = validatedFields.data;

    const encryptedMedication = buildUpdatePayload(rest, decryptedSymmetricKey);

    const newMedication = await prismadb.medication.create({
      data: { ...encryptedMedication, ...{ patientProfileId: patient.id } },
    });

    if (!currentUserPermissions.isPatient) {
      let role = patientMember?.role;
      if (!currentUserPermissions.hasAccount) {
        role =
          user?.role !== "USER" && user?.role !== "ADMIN" && user?.role !== "UPLOAD_FILES_ONLY"
            ? user?.role
            : undefined;
      }
      await createPatientNotification({
        notificationType: currentUserPermissions.isProvider
          ? "PROVIDER_MEDICATION_ADDED"
          : "ACCESS_CODE_MEDICATION_ADDED",
        patientUserId: patientMember?.patientUserId,
        dynamicData: {
          organizationName: patientMember?.organizationName,
          medicationName: name,
          role: role,
        },
      });
    }

    return { success: "medication created!", medicationId: newMedication.id };
  } catch (e) {
    return { error: "something went wrong" };
  }
};

export const editMedication = async (values: z.infer<typeof EditMedicationSchema>) => {
  try {
    const validatedFields = EditMedicationSchema.safeParse(values);
    // const session = await auth();
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const { id, patientMemberId: patientMemberIdParam } = validatedFields.data;

    let newDosageHistory = null;
    let patientMember = null;
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    const currentUserPermissions = extractCurrentUserPermissions(user);

    if (!session || !userId || !user || (!currentUserPermissions.isProvider && !currentUserPermissions.canEdit)) {
      return { error: "Unauthorized" };
    }
    if (!!patientMemberIdParam && currentUserPermissions.isProvider) {
      patientMember = await getPatientMember(patientMemberIdParam, "canAdd", { user, currentUserPermissions });
    } else if (!currentUserPermissions.isProvider && !currentUserPermissions.isPatient) {
      const code = await getAccessPatientCodeByToken(session.tempToken);
      if (!code) {
        return { error: "Unauthorized" };
      }
    }

    const whereClause = !!patientMember?.patientProfileId
      ? {
          id: patientMember?.patientProfileId,
        }
      : {
          userId: userId,
        };

    const patient = await prismadb.patientProfile.findUnique({
      where: whereClause,
      select: {
        id: true,
        symmetricKey: true,
      },
    });
    if (!patient || !patient.symmetricKey) {
      return { error: "Decryption key not found!" };
    }
    const decryptedSymmetricKey = decryptKey(patient.symmetricKey, "patientSymmetricKey");

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
    const { patientMemberId, ...rest } = validatedFields.data;

    const changesObject = findChangesBetweenObjects(decryptedCurrentMedication, rest);
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

    if (!currentUserPermissions.isPatient) {
      let role = patientMember?.role;
      if (!currentUserPermissions.hasAccount) {
        role =
          user?.role !== "USER" && user?.role !== "ADMIN" && user?.role !== "UPLOAD_FILES_ONLY"
            ? user?.role
            : undefined;
      }
      await createPatientNotification({
        notificationType: currentUserPermissions.isProvider
          ? "PROVIDER_MEDICATION_EDITED"
          : "ACCESS_CODE_MEDICATION_EDITED",
        patientUserId: patientMember?.patientUserId,
        dynamicData: {
          organizationName: patientMember?.organizationName,
          medicationName: decryptedCurrentMedication.name,
          role: role,
        },
      });
    }

    return {
      success: "Medication updated!",
      medicationName: decryptedCurrentMedication.name,
      newDosageHistory: newDosageHistory,
      createdAt: currentMedication.createdAt,
    };
  } catch (e) {
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
