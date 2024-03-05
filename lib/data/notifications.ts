"use server";

import crypto from "crypto";

import { currentUser } from "@/auth/lib/auth";
import prismadb from "@/lib/prismadb";
import { Notification } from "@prisma/client";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const getNotifications = async (
  loadMore = false,
  numOfRemainingUnreadNotifications: number,
  numOfLoadedEntries: number,
) => {
  const user = await currentUser();
  const userPermissions = extractCurrentUserPermissions(user);
  const userId = user?.id;

  if (!user || !userId || !userPermissions.hasAccount) {
    return null;
  }
  let unreadNotifications: Notification[] = [];
  // Fetch the most recent unread notifications if there are unread notifications left
  if (numOfRemainingUnreadNotifications > 0) {
    unreadNotifications = await prismadb.notification.findMany({
      where: {
        userId: userId,
        read: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
  let readNotifications: Notification[] = [];
  const unreadNotificationsLength = unreadNotifications.length;
  // If we have fewer than 5 unread notifications, fetch the remaining from the read ones
  if (unreadNotificationsLength < 5) {
    readNotifications = await prismadb.notification.findMany({
      where: {
        userId: userId,
        read: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: numOfLoadedEntries + unreadNotificationsLength,
      take: unreadNotificationsLength === 0 ? 5 : 5 - unreadNotificationsLength,
    });
  }

  // Combine both lists
  const notifications = [...unreadNotifications, ...readNotifications];

  // Extract the IDs of the retrieved notifications
  const unreadNotificationsIds = unreadNotifications.map((notification) => notification.id);

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

  if (loadMore) {
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
