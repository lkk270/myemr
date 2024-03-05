"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@/auth";
import { accessCodeType } from "@/app/types";

export const getFilesByToken = async (token: string, type: accessCodeType) => {
  const session = await auth();
  if (
    (type === "patientProfileAccessCode" &&
      (!session || !session.tempToken || session.user.role !== "UPLOAD_FILES_ONLY")) ||
    (type === "requestRecordsCode" && !token)
  ) {
    return null;
  }
  try {
    // Construct the where object conditionally based on the type
    let whereCondition = {};
    if (type === "patientProfileAccessCode") {
      whereCondition = { patientProfileAccessCodeToken: token };
    } else if (type === "requestRecordsCode") {
      whereCondition = { requestRecordsCodeToken: token };
    } else {
      return null;
    }

    const files = await prismadb.file.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        size: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return files;
  } catch (error) {
    console.error(error);
    return null;
  }
};
