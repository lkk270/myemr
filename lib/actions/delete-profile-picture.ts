"use server";

import prismadb from "@/lib/prismadb";
import { auth, update } from "@/auth";
import { currentUser } from "@/auth/lib/auth";
import { deleteS3ProfilePicture } from "./files";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const deleteProfilePicture = async () => {
  const user = await currentUser();
  const userId = user?.id;
  const currentUserPermissions = extractCurrentUserPermissions(user);

  if (!user || !userId || !currentUserPermissions.hasAccount) {
    return { error: "Unauthorized" };
  }

  try {
    await deleteS3ProfilePicture(userId);
  } catch (err) {
    return { error: "something went wrong" };
  }
  await prismadb.$transaction(
    async (prisma) => {
      await prisma.patientProfile.update({
        where: {
          userId: userId,
        },
        data: {
          imageUrl: null,
        },
      });
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          image: null,
        },
      });
    },
    { timeout: 20000 },
  );
  update({
    user: {
      image: null,
    },
  });

  return { success: "Profile picture deleted!" };
};


