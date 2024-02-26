"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@/auth";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const getActiveCodes = async (codeType: "patientProfileAccessCode" | "requestRecordsCode") => {
  const session = await auth();

  const user = session?.user;
  const userId = user?.id;

  const currentUserPermissions = extractCurrentUserPermissions(user);

  if (!session || !currentUserPermissions.isPatient) {
    return null;
  }
  if (codeType === "patientProfileAccessCode") {
    const activeCodes = await prismadb.patientProfileAccessCode.findMany({
      where: {
        userId,
        isValid: true,
        expires: { gt: new Date() },
      },
      select: {
        id: true,
        token: true,
        accessType: true,
        expires: true,
        isValid: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return activeCodes;
  } else if (codeType === "requestRecordsCode") {
    const activeCodes = await prismadb.requestRecordsCode.findMany({
      where: {
        userId,
        isValid: true,
        expires: { gt: new Date() },
      },
      select: {
        id: true,
        providerEmail: true,
        token: true,
        expires: true,
        isValid: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return activeCodes;
  }
  return null;
};
