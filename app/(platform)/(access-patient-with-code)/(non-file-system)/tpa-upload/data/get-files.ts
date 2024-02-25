"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@/auth";

export const getFilesByToken = async (token: string) => {
  const session = await auth();
  if (!session || !session.tempToken || session.user.role !== "UPLOAD_FILES_ONLY") {
    return null;
  }
  try {
    const files = await prismadb.file.findMany({
        where: { patientProfileAccessCodeToken: token },
      select: {
        id: true,
        name: true,
        size: true,
        status: true,
      },
    });
    return files;
  } catch (error) {
    return null;
  }
};
