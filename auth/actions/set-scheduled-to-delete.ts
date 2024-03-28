"use server";

import prismadb from "@/lib/prismadb";
import { currentUser } from "../lib/auth";
import { extractCurrentUserPermissions } from "../hooks/use-current-user-permissions";

export const setScheduledToDelete = async (type: "PATIENT" | "PROVIDER", newValue: boolean, userIdTemp = "") => {
  let userType = type;
  let userId = userIdTemp;
  if (!userIdTemp && newValue === true) {
    const user = await currentUser();
    userId = user?.id || "";
    const currentUserPermissions = !!user ? extractCurrentUserPermissions(user) : null;

    if (
      !user ||
      !userId ||
      !currentUserPermissions ||
      !currentUserPermissions.hasAccount ||
      userType !== user.userType
    ) {
      console.log("IN HERE");
      throw new Error("Unauthorized");
    }
  }

  await prismadb.$transaction(
    async (prisma) => {
      if (type === "PATIENT") {
        await prisma.patientProfile.update({
          where: {
            userId: userId,
          },
          data: {
            scheduledToDelete: newValue,
          },
        });
      }
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          scheduledToDelete: newValue,
        },
      });
    },
    { timeout: 20000 },
  );
};
