"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@/auth";

export const invalidateCodeById = async (id: string) => {
  const session = await auth();

  if (session) {
    return null;
  }
  try {
    await prismadb.requestRecordsCode.update({
      where: {
        id,
      },
      data: {
        isValid: false,
      },
    });
    return { success: "!isValid" };
  } catch {
    return { error: "something went wrong" };
  }
};
