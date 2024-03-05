"use server";

import prismadb from "@/lib/prismadb";
import { update } from "@/auth";
import { currentUser } from "@/auth/lib/auth";
import { deleteS3ProfilePicture } from "./files";

export const deleteProfilePicture = async () => {
  const user = await currentUser();
  const userId = user?.id;
  const isPatient = user?.role === "ADMIN" && user?.userType === "PATIENT";

  if (!user || !userId || !isPatient) {
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
