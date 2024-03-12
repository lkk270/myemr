"use server";

import prismadb from "@/lib/prismadb";

export const deleteVerificationTokens = async (authHeader: string) => {
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return { error: "unauthorized" };
  }

  await prismadb.verificationToken.deleteMany({
    where: {
      expires: { lt: new Date() },
    },
  });
};
