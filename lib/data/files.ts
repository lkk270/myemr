"use server";

import prismadb from "@/lib/prismadb";
import { FileStatus } from "@prisma/client";

export const getSumOfFilesSizes = async (
  id: string,
  idType: "userId" | "patientProfileId",
  queryByRestricted = false,
) => {
  try {
    // Construct the where clause dynamically
    const whereClause = queryByRestricted
      ? {
          status: FileStatus.SUCCESS,
          [idType]: id,
        }
      : {
          status: FileStatus.SUCCESS,
          [idType]: id,
          restricted: false,
        };

    const aggregateOfSuccessFiles = await prismadb.file.aggregate({
      _sum: {
        size: true,
      },
      where: whereClause,
    });

    const sumOfSuccessFilesSizes = aggregateOfSuccessFiles._sum.size || 0n;
    return sumOfSuccessFilesSizes;
  } catch (error) {
    return null;
  }
};
