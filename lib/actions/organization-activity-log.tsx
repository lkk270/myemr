"use server";

import { currentUser } from "@/auth/lib/auth";
// import { auth } from "@/auth";
import prismadb from "@/lib/prismadb";
// import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { OrganizationActivityLogPostSchema } from "../schemas/organization-activity-log";
import { z } from "zod";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const createOrganizationActivityLog = async (
  values: z.infer<typeof OrganizationActivityLogPostSchema>,
  defaultReadValue = false,
) => {
  try {
    const user = await currentUser();
    const userPermissions = extractCurrentUserPermissions(user);
    const userId = user?.id;

    if (!user || !userId || !userPermissions.hasAccount) {
      return null;
    }

    const validatedFields = OrganizationActivityLogPostSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    const { organizationId, type, dynamicData } = validatedFields.data;

    await prismadb.organizationActivity.create({
      data: {
        organizationId,
        type,
        read: defaultReadValue,
        dynamicData,
      },
    });
    return { success: "Organization activity log created!" };
  } catch {
    return { error: "something went wrong" };
  }
};
