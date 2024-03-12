"use server";

import prismadb from "@/lib/prismadb";
import { currentUser } from "@/auth/lib/auth";
import { FileStatus, InsuranceFile } from "@prisma/client";
import { File } from "@prisma/client";

export const updateRegularFileStatus = async (fileId: string, forRR = false) => {
  const user = await currentUser();

  if (!forRR && (!user || user.role === "READ_ONLY")) {
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
    },
    { timeout: 20000 },
  );

  return { success: "Settings Updated!", file: file };
};

export const updateInsuranceStatus = async (fileId: string) => {
  const user = await currentUser();
  const isPatient = user?.role === "ADMIN" && user?.userType === "PATIENT";

  if (!user || !isPatient) {
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

export const setHasUploadedToTrue = async (requestRecordsCodeId: string) => {
  await prismadb.requestRecordsCode.update({
    where: {
      id: requestRecordsCodeId,
    },
    data: {
      hasUploaded: true,
    },
  });

  return { success: "hasUploaded set to true!" };
};
