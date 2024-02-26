"use server";

import prismadb from "@/lib/prismadb";
import { auth } from "@/auth";

export const getFilesByToken = async (
  token: string,
  type: "patientProfileAccessCodeToken" | "requestRecordsCodeToken",
) => {
  const session = await auth();
  if (!session || !session.tempToken || session.user.role !== "UPLOAD_FILES_ONLY") {
    return null;
  }
  try {
    // Construct the where object conditionally based on the type
    let whereCondition = {};
    if (type === "patientProfileAccessCodeToken") {
      whereCondition = { patientProfileAccessCodeToken: token };
    } else if (type === "requestRecordsCodeToken") {
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
