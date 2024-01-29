"use server";

import prismadb from "@/lib/prismadb";
import { currentUser } from "@/auth/lib/auth";
import { FileUploadStatus } from "@prisma/client";

export const updateStatus = async (fileId: string) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  await prismadb.file.update({
    where: {
      id: fileId,
    },
    data: {
      status: FileUploadStatus.SUCCESS,
    },
  });

  return { success: "Settings Updated!" };
};
