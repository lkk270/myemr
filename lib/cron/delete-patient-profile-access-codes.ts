"use server";

import prismadb from "@/lib/prismadb";

export const deletePatientProfileAccessCodes = async (authHeader: string) => {
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return { error: "unauthorized" };
  }

  await prismadb.patientProfileAccessCode.deleteMany({
    where: {
      OR: [{ expires: { lt: new Date() } }, { isValid: false }],
    },
  });
};
