"use server";

import { currentUser } from "@/auth/lib/auth";
import { extractCurrentUserPermissions } from "../hooks/use-current-user-permissions";
import { ExtendedUser } from "@/next-auth";
import prismadb from "@/lib/prismadb";

import { currentUserPermissionsType } from "@/app/types";

export const getPatientMember = async (
  patientMemberId: string,
  requiredPermissions: "canEdit" | "canAdd" | "canDelete" | "canRead",
  userParam: { user: ExtendedUser | null; currentUserPermissions: currentUserPermissionsType } | null = null,
) => {
  let user: ExtendedUser | null = userParam && userParam.user;
  let currentUserPermissions = userParam && userParam.currentUserPermissions;
  if (!userParam) {
    user = await currentUser();
    currentUserPermissions = extractCurrentUserPermissions(user);
  }
  if (!user || !currentUserPermissions || !currentUserPermissions.isProvider) {
    return null;
  }
  const patientMember = await prismadb.patientMember.findUnique({
    where: {
      id: patientMemberId,
    },
  });

  const effectiveUser = !!user && !!patientMember ? { ...user, role: patientMember.role } : user;
  const effectiveUserPermissions = extractCurrentUserPermissions(effectiveUser);

  if (!effectiveUserPermissions[requiredPermissions]) {
    return null;
  }

  return patientMember;
};
