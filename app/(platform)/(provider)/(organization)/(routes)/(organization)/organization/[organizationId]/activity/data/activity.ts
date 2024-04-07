"use server";

import { currentUser } from "@/auth/lib/auth";
import prismadb from "@/lib/prismadb";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const getActivityLogs = async (forBaseClick = false, numOfLoadedEntries: number, organizationId: string) => {
  const user = await currentUser();
  const userPermissions = extractCurrentUserPermissions(user);
  const userId = user?.id;

  if (!user || !userId || !userPermissions.hasAccount || user.userType !== "PROVIDER") {
    return null;
  }

  const activityLogs = await prismadb.organizationActivity.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: numOfLoadedEntries,
    take: 10,
  });

  const unreadActivityIds = activityLogs
    .filter((activity) => !activity.read && !!activity.id)
    .map((activity) => activity.id);

  // Update the 'read' field of the retrieved activity logs to true
  await prismadb.organizationActivity.updateMany({
    where: {
      id: {
        in: unreadActivityIds,
      },
    },
    data: {
      read: true,
    },
  });

  if (forBaseClick) {
    const totalNumOfActivityLogs = await prismadb.organizationActivity.count({
      where: {
        organizationId,
      },
    });

    return { activityLogs, totalNumOfActivityLogs };
  }
  return { activityLogs };
};

export const getNumberOfUnreadActivityLogs = async (organizationId: string) => {
  const user = await currentUser();
  const userPermissions = extractCurrentUserPermissions(user);
  const userId = user?.id;

  if (!user || !userId || !userPermissions.hasAccount || user.userType !== "PROVIDER") {
    return 0;
  }
  const numOfUnreadActivityLogs = await prismadb.organizationActivity.count({
    where: {
      organizationId,
      read: false,
    },
  });
  return numOfUnreadActivityLogs;
};
