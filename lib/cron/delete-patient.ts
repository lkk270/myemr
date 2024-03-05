"use server";

import prismadb from "@/lib/prismadb";
import { deleteS3Objects, getAllFilesToDeleteForDeleteAccount } from "../actions/files";
import { stripe } from "../stripe/stripe";

export const deletePatient = async (authHeader: string) => {
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return { error: "unauthorized" };
  }

  const patientUsersToDelete = await prismadb.user.findMany({
    where: { scheduledToDelete: true, type: "PATIENT" },
    select: {
      id: true,
      patientProfile: {
        select: {
          id: true,
        },
      },
    },
  });

  //   const allUserIdsToDelete = patientUsersToDelete.map((user) => user.id);

  for (const user of patientUsersToDelete) {
    if (!user || !user.patientProfile) continue;
    const patientProfileId = user.patientProfile.id;
    const { rawObjects, convertedObjects } = await getAllFilesToDeleteForDeleteAccount(patientProfileId);
    try {
      const userSubscription = await prismadb.userSubscription.findUnique({
        where: {
          userId: user.id,
        },
      });
      if (!!userSubscription && !!userSubscription.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.cancel(userSubscription.stripeSubscriptionId);
      }
      await deleteS3Objects(convertedObjects, rawObjects, patientProfileId);

      await prismadb.user.delete({
        where: {
          id: user.id,
        },
      });
    } catch {
      await prismadb.failedDeleteS3FilesOnAccountDelete.create({
        data: {
          userId: user.id,
          patientProfileId: patientProfileId,
        },
      });
    }
  }
};
