"use server";

import prismadb from "@/lib/prismadb";

export const deletePasswordResetTokens = async (authHeader: string) => {
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return { error: "unauthorized" };
  }

  await prismadb.passwordResetToken.deleteMany({
    where: {
      expires: { lt: new Date() },
    },
  });
};
