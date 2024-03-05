"use server";

import prismadb from "@/lib/prismadb";

export const deleteRequestRecordsCodes = async (authHeader: string) => {
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return { error: "unauthorized" };
  }

  await prismadb.requestRecordsCode.deleteMany({
    where: {
      expires: { lt: new Date() },
    },
  });
};
