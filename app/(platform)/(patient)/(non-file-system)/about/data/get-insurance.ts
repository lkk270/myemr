"use server";

import prismadb from "@/lib/prismadb";
import { currentUser } from "@/auth/lib/auth";

export const getInsurance = async () => {
  const user = await currentUser();

  if (!user || user?.role !== "UPLOAD_FILES_ONLY") {
    return { error: "Unauthorized" };
  }
  try {
    const insurance = await prismadb.insuranceFile.findMany({
      where: {
        userId: user.id,
      },
      select: {
        side: true,
      },
      orderBy: {
        side: "asc",
      },
    });
    return { insurance: insurance };
  } catch (error) {
    return { error: "Something went wrong" };
  }
};
