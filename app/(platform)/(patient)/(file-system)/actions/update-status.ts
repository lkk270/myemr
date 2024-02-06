"use server";

import prismadb from "@/lib/prismadb";
import { currentUser } from "@/auth/lib/auth";
import { FileStatus } from "@prisma/client";
import { File } from "@prisma/client";

export const updateStatus = async (fileId: string) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  let file: File | undefined;
  await prismadb.$transaction(
    async (prisma) => {
      file = await prisma.file.update({
        where: {
          id: fileId,
        },
        data: {
          status: FileStatus.SUCCESS,
        },
      });

      //   if (file) {
      //     await prisma.patientProfile.update({
      //       where: {
      //         userId: file.userId,
      //       },
      //       data: {
      //         usedFileStorage: { increment: size },
      //       },
      //     });
      //   } else {
      //     return { error: "No file created!" };
      //   }
    },
    { timeout: 20000 },
  );

  return { success: "Settings Updated!", file: file };
};

export const decrementUsedFileStorage = async (fileId: string) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }
  const file = await prismadb.file.findUnique({
    where: {
      id: fileId,
    },
  });
  if (file) {
    await prismadb.patientProfile.update({
      where: { userId: user.id },
      data: { usedFileStorage: { decrement: file.size } },
    });
  }
};
