"use server";

import { z } from "zod";
import prismadb from "@/lib/prismadb";

import { auth } from "@/auth";
import { createOrganizationActivityLog } from "@/lib/actions/organization-activity-log";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

import { AddOrganizationSchema, ChangeOrganizationRoleSchema, RemoveOrganizationSchema } from "../schemas";
export const addOrganizationForPatient = async (values: z.infer<typeof AddOrganizationSchema>) => {
  try {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    const currentUserPermissions = extractCurrentUserPermissions(user);
    if (!session || !userId || !user || !user.email || !currentUserPermissions.isPatient) {
      return { error: "Unauthorized" };
    }

    const validatedFields = AddOrganizationSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const { patientJoinToken, role, accessibleRootFolderIds } = values;
    if (accessibleRootFolderIds === "ALL") {
      return { error: "Invalid accessibleRootFolderIds" };
    }
    const organization = await prismadb.organization.findUnique({
      where: {
        patientJoinToken,
      },
      select: {
        id: true,
        title: true,
      },
    });
    if (!organization) {
      return { error: "No organization found" };
    }
    const patient = await prismadb.patientProfile.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!patient) {
      return { error: "No patient found" };
    }

    const member = await prismadb.patientMember.create({
      data: {
        role,
        patientUserId: userId,
        patientProfileId: patient.id,
        accessibleRootFolders: accessibleRootFolderIds,
        organizationName: organization.title,
        organizationId: organization.id,
      },
    });

    await createOrganizationActivityLog({
      organizationId: organization.id,
      type: "ADDED_BY_PATIENT",
      dynamicData: {
        patientEmail: user.email,
        role: role,
      },
    });

    return {
      success: "You have successfully added the organization.",
      member,
    };
  } catch (err: any) {
    let message = "Something went wrong";
    // console.log(err);
    if (!!err.stack && err.stack.toLowerCase().includes("unique constraint failed")) {
      message = "You already have this organization added.";
    }
    return { error: message, member: null };
  }
};

export const changeOrganizationPermissions = async (values: z.infer<typeof ChangeOrganizationRoleSchema>) => {
  try {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    const currentUserPermissions = extractCurrentUserPermissions(user);
    if (!session || !userId || !user || !user.email || !currentUserPermissions.isPatient) {
      return { error: "Unauthorized" };
    }

    const validatedFields = ChangeOrganizationRoleSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    const { memberId, role } = values;

    await prismadb.patientMember.update({
      where: {
        id: memberId,
      },
      data: {
        role,
      },
    });

    return {
      success: "Role successfully changed",
    };
  } catch (err) {
    return { error: "Something went wrong" };
  }
};

export const removeOrganization = async (values: z.infer<typeof RemoveOrganizationSchema>) => {
  try {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    const currentUserPermissions = extractCurrentUserPermissions(user);
    if (!session || !userId || !user || !user.email || !currentUserPermissions.isPatient) {
      return { error: "Unauthorized" };
    }

    const validatedFields = RemoveOrganizationSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    const { memberId } = values;

    await prismadb.patientMember.delete({
      where: {
        id: memberId,
      },
    });

    return {
      success: "Organization successfully removed",
    };
  } catch (err) {
    return { error: "Something went wrong" };
  }
};
