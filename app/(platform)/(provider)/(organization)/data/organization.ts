"use server";

import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { currentUser } from "@/auth/lib/auth";
import prismadb from "@/lib/prismadb";

export const getOrganizationMemberByUserId = async (organizationId: string, userIdParam = "") => {
  const user = await currentUser();
  const userPermissions = extractCurrentUserPermissions(user);
  const userId = user?.id;

  if (!user || !userId || !userPermissions.hasAccount) {
    return null;
  }

  const organizationMember = await prismadb.organizationMember.findFirst({
    where: {
      organizationId,
      userId: !!userIdParam ? userIdParam : userId,
    },
    select: {
      id: true,
      role: true,
      organization: {
        select: { title: true },
      },
    },
  });

  return organizationMember;
};

export const getOrganizationMemberById = async (memberId: string) => {
  const user = await currentUser();
  const userPermissions = extractCurrentUserPermissions(user);
  const userId = user?.id;

  if (!user || !userId || !userPermissions.hasAccount) {
    return null;
  }

  const organizationMember = await prismadb.organizationMember.findFirst({
    where: {
      id: memberId,
    },
    select: {
      id: true,
      role: true,
      organization: {
        select: { title: true },
      },
    },
  });

  return organizationMember;
};

export const getOrganizationMemberByEmail = async (organizationId: string, email: string) => {
  const user = await currentUser();
  const userPermissions = extractCurrentUserPermissions(user);
  const userId = user?.id;

  if (!user || !userId || !userPermissions.hasAccount) {
    return null;
  }

  const organizationMember = await prismadb.organizationMember.findFirst({
    where: {
      organizationId,
      email,
    },
    select: {
      id: true,
      role: true,
    },
  });

  return organizationMember;
};

export const getInviteMemberCodeByEmail = async (email: string, organizationId: string) => {
  try {
    const inviteMemberCode = await prismadb.organizationInviteCode.findFirst({
      where: { email, organizationId },
    });

    return inviteMemberCode;
  } catch {
    return null;
  }
};

export const getInviteMemberCodeByToken = async (email: string, token: string) => {
  try {
    const inviteMemberCode = await prismadb.organizationInviteCode.findFirst({
      where: { email, token },
    });

    return inviteMemberCode;
  } catch {
    return null;
  }
};
