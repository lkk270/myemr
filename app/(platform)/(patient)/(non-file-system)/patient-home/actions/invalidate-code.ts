"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@/auth";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { accessCodeType } from "@/app/types";

export const invalidateActiveCode = async (id: string, codeType: accessCodeType) => {
  const session = await auth();
  const user = session?.user;
  const currentUserPermissions = extractCurrentUserPermissions(user);

  if (!session || !currentUserPermissions.isPatient) {
    return { error: "unauthorized!" };
  }

  try {
    // Construct the where object conditionally based on the type
    if (codeType === "patientProfileAccessCode") {
      await prismadb.patientProfileAccessCode.update({
        where: {
          id,
        },
        data: {
          isValid: false,
        },
      });
      return { success: "success!" };
    } else if (codeType === "requestRecordsCode") {
      await prismadb.requestRecordsCode.update({
        where: {
          id,
        },
        data: {
          isValid: false,
        },
      });
      return { success: "success!" };
    }
    return { error: "Error something went wrong!" };
  } catch (error) {
    console.error(error);
    return { error: "Error something went wrong!" };
  }
};
