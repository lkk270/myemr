"use server";

import { currentUser } from "@/auth/lib/auth";
import { setScheduledToDelete } from "@/auth/actions/set-scheduled-to-delete";

export const deleteAccount = async () => {
  const user = await currentUser();
  const userId = user?.id;
  const isPatient = user?.role === "ADMIN" && user?.userType === "PATIENT";

  if (!user || !userId || !isPatient) {
    return { error: "Unauthorized" };
  }
  try {
    await setScheduledToDelete("PATIENT", true, userId);
    return { success: "Account deleted!" };
  } catch {
    return { error: "Something went wrong" };
  }
};
