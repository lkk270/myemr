"use server";

import prismadb from "@/lib/prismadb";
import { currentUser } from "@/auth/lib/auth";
import { FileStatus, InsuranceFile } from "@prisma/client";
import { File } from "@prisma/client";

export const updateRegularFileStatus = async (fileId: string) => {
  const user = await currentUser();

  if (!user || user.role === "READ_ONLY") {
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

export const updateInsuranceStatus = async (fileId: string) => {
  const user = await currentUser();

  if (!user || user.role === "READ_ONLY") {
    return { error: "Unauthorized" };
  }

  let file: InsuranceFile | undefined;
  await prismadb.$transaction(
    async (prisma) => {
      file = await prisma.insuranceFile.update({
        where: {
          id: fileId,
        },
        data: {
          status: FileStatus.SUCCESS,
        },
      });

      if (file) {
        await prisma.patientProfile.update({
          where: {
            id: file.patientProfileId,
          },
          data: {
            insuranceImagesSet: true,
          },
        });
      } else {
        return { error: "No file created!" };
      }
    },
    { timeout: 20000 },
  );

  return { success: "Settings Updated!", file: file };
};

export const decrementUsedFileStorage = async (fileId: string) => {
  const user = await currentUser();

  if (!user || user.role === "READ_ONLY") {
    return { error: "Unauthorized" };
  }
  const file = await prismadb.file.findUnique({
    where: {
      id: fileId,
      status: "NOT_UPLOADED",
    },
  });
  if (file) {
    await prismadb.patientProfile.update({
      where: { userId: user.id },
      data: { usedFileStorage: { decrement: file.size } },
    });
  }
};
