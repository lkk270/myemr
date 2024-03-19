"use server";

import prismadb from "@/lib/prismadb";

export const setScheduledToDelete = async (type: "PATIENT" | "PROVIDER", newValue: boolean, userId: string) => {
  await prismadb.$transaction(
    async (prisma) => {
      if (type === "PATIENT") {
        await prisma.patientProfile.update({
          where: {
            userId: userId,
          },
          data: {
            scheduledToDelete: newValue,
          },
        });
      } else if (type === "PROVIDER") {
        // await prisma.providerProfile.update({
        //   where: {
        //     userId: userId,
        //   },
        //   data: {
        //     scheduledToDelete: newValue,
        //   },
        // });
      }

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          scheduledToDelete: newValue,
        },
      });
    },
    { timeout: 20000 },
  );
};
