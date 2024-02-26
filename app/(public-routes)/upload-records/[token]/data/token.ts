"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@/auth";

export const getCodeByToken = async (token: string) => {
  const session = await auth();

  if (session) {
    return null;
  }
  const code = await prismadb.requestRecordsCode.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
      parentFolderId: true,
      token: true,
      expires: true,
      isValid: true,
      createdAt: true,
    },
  });
  return code;
};
