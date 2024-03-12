"use server";

import crypto from "crypto";

import { currentUser } from "@/auth/lib/auth";
import prismadb from "@/lib/prismadb";
import { accessCodeValidTimeObj } from "@/lib/constants";
import { UserRole, AccessCodeValidTime } from "@prisma/client";

export const generateAccessCode = async (
  patientProfileId: string,
  validFor: AccessCodeValidTime,
  accessType: UserRole,
  uploadToId: string,
) => {
  const user = await currentUser();
  const userId = user?.id;
  const isPatient = user?.role === "ADMIN" && user?.userType === "PATIENT";

  if (!user || !userId || !isPatient) {
    return null;
  }

  const token = crypto.randomInt(1_000_000, 10_000_000).toString();
  const expires = new Date(new Date().getTime() + accessCodeValidTimeObj[validFor] * 1000);

  const verificationToken = await prismadb.patientProfileAccessCode.create({
    data: {
      patientProfileId: patientProfileId,
      userId: userId,
      validFor: validFor,
      accessType: accessType,
      parentFolderId: !!uploadToId ? uploadToId : null,
      token,
      expires,
    },
  });

  return verificationToken;
};
