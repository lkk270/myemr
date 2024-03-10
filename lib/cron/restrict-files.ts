"use server";

import prismadb from "@/lib/prismadb";
import { restrictFiles } from "../actions/files";
import { NextResponse } from "next/server";
import { getSumOfFilesSizes } from "../data/files";

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
  // console.log("len of expired subscriptions: " + expiredSubscriptions.length);
  const userIdsOfExpiredSubscriptions = expiredSubscriptions.map((obj) => obj.userId);

  for (const userId of userIdsOfExpiredSubscriptions) {
    const patient = await prismadb.patientProfile.findUnique({
      where: { userId },
      select: {
        id: true,
      },
    });
    if (patient) {
      const sumOfAllSuccessFilesSizes = await getSumOfFilesSizes(patient.id, "patientProfileId");
      if (typeof sumOfAllSuccessFilesSizes !== "bigint") {
        return new NextResponse("Something went wrong", { status: 500 });
      }
      try {
        await restrictFiles({ ...patient, plan: freePlan, sumOfAllSuccessFilesSizes: sumOfAllSuccessFilesSizes });
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
