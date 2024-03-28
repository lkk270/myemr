"use server";

import { currentUser } from "@/auth/lib/auth";
import { setScheduledToDelete } from "@/auth/actions/set-scheduled-to-delete";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import prismadb from "../prismadb";

export const deleteAccount = async () => {
  const user = await currentUser();
  const userId = user?.id;
  const currentUserPermissions = !!user ? extractCurrentUserPermissions(user) : null;

  if (!user || !userId || !currentUserPermissions || !currentUserPermissions.hasAccount) {
    return { error: "Unauthorized" };
  }
  if (currentUserPermissions.isProvider) {
    const ownedOrganizations = await prismadb.organizationMember.findMany({
      where: {
        userId,
        role: "OWNER",
      },
      select: {
        organizationId: true,
      },
    });
    let numOfSoleOwnedOrganizations = 0;
    for (const organization of ownedOrganizations) {
      const owners = await prismadb.organizationMember.findMany({
        where: {
          organizationId: organization.organizationId,
          role: "OWNER",
        },
        select: {
          id: true,
        },
      });
      if (owners.length === 1) {
        numOfSoleOwnedOrganizations += 1;
      }
    }
    if (numOfSoleOwnedOrganizations > 0) {
      const organizationText =
        numOfSoleOwnedOrganizations === 1 ? "organization. You" : "organizations. For each organization, you";
      return {
        error: `You are the sole owner of ${numOfSoleOwnedOrganizations} ${organizationText} will first need to either make an existing member the owner or delete the organization before continuing with your account deletion.`,
      };
    }
  }
  try {
    await setScheduledToDelete(user.userType, true);
    return { success: "Account scheduled for deletion!" };
  } catch {
    return { error: "Something went wrong" };
  }
};
