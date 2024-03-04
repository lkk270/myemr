"use server";

import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import prismadb from "../prismadb";
import { auth } from "@/auth";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
  const session = await auth();
  const user = session?.user;
  const userId = user?.id;

  const currentUserPermissions = extractCurrentUserPermissions(user);

  if (!session || !user || !userId || !currentUserPermissions.isPatient) {
    return false;
  }

  const userSubscription = await prismadb.userSubscription.findUnique({
    where: {
      userId,
    },
    select: {
      stripeCustomerId: true,
      stripePriceId: true,
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
    },
  });
  if (!userSubscription) {
    return false;
  }
  const isValid =
    userSubscription.stripePriceId && userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  return !!isValid;
};

export const getSubscription = async (userId: string) => {
  const session = await auth();
  const user = session?.user;

  const currentUserPermissions = extractCurrentUserPermissions(user);

  if (!session || !user || !user.id || !currentUserPermissions.isPatient) {
    return null;
  }

  const userSubscription = await prismadb.userSubscription.findUnique({
    where: {
      userId,
    },
  });
  return userSubscription;
};

export const getSubscriptionRigorous = async (userId: string) => {

  let currentDatePlusOne = new Date();
  currentDatePlusOne.setDate(currentDatePlusOne.getDate() + 1);

  const userSubscription = await prismadb.userSubscription.findUnique({
    where: {
      userId,
      stripeCurrentPeriodEnd: { gt: currentDatePlusOne },
    },
  });
  return userSubscription;
};

export const getPatient = async (userId: string) => {
  const patient = await prismadb.patientProfile.findUnique({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      usedFileStorage: true,
      unrestrictedUsedFileStorage: true,
    },
  });

  return patient;
};
