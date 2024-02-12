import crypto from "crypto";

import prismadb from "@/lib/prismadb";
import { accessCodeValidTimeObj } from "@/lib/constants";
import { UserRole, AccessCodeValidTime } from "@prisma/client";

export const generateAccessCode = async (
  patientProfileId: string,
  userId: string,
  validFor: AccessCodeValidTime,
  accessType: UserRole,
) => {
  const token = crypto.randomInt(1_000_000, 10_000_000).toString();
  const expires = new Date(new Date().getTime() + accessCodeValidTimeObj[validFor] * 1000);

  const verificationToken = await prismadb.patientProfileAccessCode.create({
    data: {
      patientProfileId: patientProfileId,
      userId: userId,
      validFor: validFor,
      accessType: accessType,
      token,
      expires,
    },
  });

  return verificationToken;
};
