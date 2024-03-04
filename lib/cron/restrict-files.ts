"use server";

import prismadb from "@/lib/prismadb";
import { restrictFiles } from "../actions/files";

const freePlan = "PATIENT_FREE";

export const restrictFilesCron = async (authHeader: string) => {
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return { error: "unauthorized" };
  }

  let currentDatePlusOne = new Date();
  currentDatePlusOne.setDate(currentDatePlusOne.getDate() + 1);

  const expiredSubscriptions = await prismadb.userSubscription.findMany({
    where: {
      stripeCurrentPeriodEnd: { lt: currentDatePlusOne },
    },
    select: {
      userId: true,
    },
  });
  const userIdsOfExpiredSubscriptions = expiredSubscriptions.map((obj) => obj.userId);

  for (const userId of userIdsOfExpiredSubscriptions) {
    const patient = await prismadb.patientProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        usedFileStorage: true,
        unrestrictedUsedFileStorage: true,
      },
    });
    if (patient) {
      try {
        await restrictFiles({ ...patient, plan: freePlan });
      } catch {
        await prismadb.failedRestrictFilesUserId.create({
          data: {
            userId,
            reason: "restrictFiles failed",
          },
        });
      }
    } else {
      await prismadb.failedRestrictFilesUserId.create({
        data: {
          userId,
          reason: "no patient found",
        },
      });
    }
  }
};
