"use server";

import crypto from "crypto";

import { currentUser } from "@/auth/lib/auth";
import prismadb from "@/lib/prismadb";
import { Notification } from "@prisma/client";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const getNotifications = async (forBaseClick = false, numOfLoadedEntries: number) => {
  const user = await currentUser();
  const userPermissions = extractCurrentUserPermissions(user);
  const userId = user?.id;

  if (!user || !userId || !userPermissions.hasAccount) {
    return null;
  }

  const notifications = await prismadb.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: numOfLoadedEntries,
    take: 5,
  });

  const unreadNotificationsIds = notifications
    .filter((notification) => !notification.read && !!notification.id)
    .map((notification) => notification.id);

  // Update the 'read' field of the retrieved notifications to true
  await prismadb.notification.updateMany({
    where: {
      id: {
        in: unreadNotificationsIds,
      },
    },
    data: {
      read: true,
    },
  });

  if (forBaseClick) {
    const totalNumOfNotifications = await prismadb.notification.count({
      where: {
        userId: userId,
      },
    });

    return { notifications: notifications, totalNumOfNotifications: totalNumOfNotifications };
  }
  return { notifications: notifications };
};

export const getNumberOfUnreadNotifications = async () => {
  const user = await currentUser();
  const userPermissions = extractCurrentUserPermissions(user);
  const userId = user?.id;

  if (!user || !userId || !userPermissions.hasAccount) {
    return 0;
  }
  const numOfUnreadNotifications = await prismadb.notification.count({
    where: {
      userId,
      read: false,
    },
  });
  return numOfUnreadNotifications;
};
