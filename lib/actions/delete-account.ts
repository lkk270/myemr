"use server";

import { currentUser } from "@/auth/lib/auth";
import { setScheduledToDelete } from "@/auth/actions/set-scheduled-to-delete";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const deleteAccount = async () => {
  const user = await currentUser();
  const userId = user?.id;
  const currentUserPermissions = !!user ? extractCurrentUserPermissions(user) : null;

  if (!user || !userId || !currentUserPermissions || !currentUserPermissions.isPatient) {
    return { error: "Unauthorized" };
  }
  try {
    await setScheduledToDelete(user.userType, true, userId);
    return { success: "Account deleted!" };
  } catch {
    return { error: "Something went wrong" };
  }
};
