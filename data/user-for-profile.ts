"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@/auth";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";

export const getPatient = async () => {
  const session = await auth();
  const user = session?.user;
  const userId = user?.id;
  const userPermissions = extractCurrentUserPermissions(user);
  if (!session || !user || !userId || !userPermissions.isPatient) {
    return null;
  } else {
    const patient = await prismadb.patientProfile.findUnique({
      where: {
        userId,
      },
      select: {
        firstName: true,
        lastName: true,
        plan: true,
        imageUrl: true,
        symmetricKey: true,
      },
    });
    if (!patient) {
      return null;
    }
    let decryptedPatient;

    const decryptedSymmetricKey = decryptKey(patient.symmetricKey, "patientSymmetricKey");
    decryptedPatient = decryptMultiplePatientFields(patient, decryptedSymmetricKey);
    const { symmetricKey, ...safeObject } = decryptedPatient;

    return safeObject;
  }
};
