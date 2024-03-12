"use server";

import { currentUser } from "@/auth/lib/auth";
// import { auth } from "@/auth";
import prismadb from "@/lib/prismadb";
// import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { NotificationPostSchema } from "../schemas/notification";
import { z } from "zod";

export const createNotification = async (values: z.infer<typeof NotificationPostSchema>) => {
  try {
    const validatedFields = NotificationPostSchema.safeParse(values);
    // const session = await auth();
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    const { text, type, requestRecordsCodeToken } = validatedFields.data;
    let forUserId;
    if (type === "ACCESS_CODE") {
      const user = await currentUser();
      // const userPermissions = extractCurrentUserPermissions(user);
      const userId = user?.id;
      forUserId = userId;
      if (!user || !userId) {
        return { error: "Unauthorized" };
      }
    } else if (type === "REQUEST_RECORDS_UPLOAD") {
      const requestRecordsCode = await prismadb.requestRecordsCode.findUnique({
        where: {
          token: requestRecordsCodeToken,
          isValid: true,
          expires: { gt: new Date() },
        },
        select: {
          id: true,
          userId: true,
        },
      });
      if (!requestRecordsCode) {
        return { error: "Unauthorized" };
      }
      forUserId = requestRecordsCode.userId;
    }

    await prismadb.notification.create({
      data: {
        userId: forUserId!!,
        text,
      },
    });
    return { success: "notification created!" };
  } catch {
    return { error: "something went wrong" };
  }
};
