"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@/auth";

export const getCodeByToken = async (token: string) => {
  const session = await auth();

  // if (session) {
  //   return null;
  // }
  const code = await prismadb.requestRecordsCode.findUnique({
    where: {
      token,
      isValid: true,
    },
    select: {
      id: true,
      userId: true,
      parentFolderId: true,
      token: true,
      hasUploaded: true,
      expires: true,
      isValid: true,
      createdAt: true,
      providerEmail: true,
    },
  });
  return code;
};
