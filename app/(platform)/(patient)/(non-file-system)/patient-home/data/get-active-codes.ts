"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@/auth";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const getActivePatientProfileAccessCodes = async () => {
  const session = await auth();

  const user = session?.user;
  const userId = user?.id;

  const currentUserPermissions = extractCurrentUserPermissions(user);

  if (!session || !currentUserPermissions.isPatient) {
    return null;
  }

  const activeCodes = await prismadb.patientProfileAccessCode.findMany({
    where: {
      userId,
      isValid: true,
      expires: { gt: new Date() },
    },
  });
  return activeCodes;
};

export const getActiveRequestRecordsCodes = async () => {
  const session = await auth();

  const user = session?.user;
  const userId = user?.id;

  const currentUserPermissions = extractCurrentUserPermissions(user);

  if (!session || !currentUserPermissions.isPatient) {
    return null;
  }

  const activeCodes = await prismadb.requestRecordsCode.findMany({
    where: {
      userId,
      isValid: true,
      expires: { gt: new Date() },
    },
  });
  return activeCodes;
};
