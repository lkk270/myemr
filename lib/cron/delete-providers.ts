"use server";

import prismadb from "@/lib/prismadb";
import { deleteS3ProfilePicture } from "../actions/files";
import { sendSuccessfullyDeletedAccountEmail } from "@/auth/lib/mail/mail";

export const deleteProviders = async (authHeader: string) => {
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return { error: "unauthorized" };
  }

  const providerUsersToDelete = await prismadb.user.findMany({
    where: { scheduledToDelete: true, type: "PROVIDER" },
    select: {
      id: true,
      email: true,
    },
  });

  let reason = "";
  for (const user of providerUsersToDelete) {
    if (!user || !user.email) {
      continue;
    }
    try {
      //   reason = "failed on: userSubscription get";
      //   const userSubscription = await prismadb.userSubscription.findUnique({
      //     where: {
      //       userId: user.id,
      //     },
      //   });

      //   if (!!userSubscription && !!userSubscription.stripeSubscriptionId) {
      //     reason = "failed on: stripe subscriptions cancel";
      //     await stripe.subscriptions.cancel(userSubscription.stripeSubscriptionId);
      //   }

      reason = "failed on: deleteS3ProfilePicture";
      await deleteS3ProfilePicture(user.id);

      reason = "failed on:  prismadb.user.delete";
      await prismadb.user.delete({
        where: {
          id: user.id,
        },
      });

      reason = "failed on: sendSuccessfullyDeletedAccountEmail";
      await sendSuccessfullyDeletedAccountEmail(user.email, "Provider");
    } catch (error) {
      //   console.log("error");
      await prismadb.failedAccountDelete.create({
        data: {
          userId: user.id,
          patientProfileId: "provider",
          reason: reason,
        },
      });
    }
  }
};
