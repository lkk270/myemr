"use client";

import axios from "axios";

import { useState, startTransition, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Bell, Dot } from "lucide-react";
import { Notification, OrganizationActivity } from "@prisma/client";
import { getActivityLogs } from "../data/activity";
import { ActivityItem } from "./activity-item";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizationStore } from "@/app/(platform)/(provider)/(organization)/_components/hooks/use-organizations";

type ActivityListProps = {
  organizationId: string;
  initialNumOfUnreadActivityLogs: number;
  initialActivityLogsObj: { activityLogs: OrganizationActivity[]; totalNumOfActivityLogs: number };
};

export const ActivityList = ({
  organizationId,
  initialNumOfUnreadActivityLogs,
  initialActivityLogsObj,
}: ActivityListProps) => {
  const { patchOrganization } = useOrganizationStore();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activityLogs, setActivityLogs] = useState<OrganizationActivity[]>(initialActivityLogsObj.activityLogs);
  const [totalNumOfActivityLogs, setTotalNumOfActivityLogs] = useState(initialActivityLogsObj.totalNumOfActivityLogs);
  const [numOfLoadedEntries, setNumOfLoadedEntries] = useState(initialActivityLogsObj.activityLogs.length);
  const [numOfUnreadActivityLogs, setNumOfUnreadActivityLogs] = useState(initialNumOfUnreadActivityLogs);

  useEffect(() => {
    console.log(Math.min(10, numOfUnreadActivityLogs));
    patchOrganization(organizationId, {
      numOfUnreadActivities: initialNumOfUnreadActivityLogs - Math.min(10, initialNumOfUnreadActivityLogs),
    });
  }, []);
  const onLoadMore = () => {
    setIsLoadingMore(true);
    startTransition(() => {
      const numOfUnreadActivityLogsToFetch = Math.min(10, Math.max(0, numOfUnreadActivityLogs));
      getActivityLogs(false, numOfLoadedEntries, organizationId)
        .then((data) => {
          if (!!data && !!data.activityLogs) {
            const newNumOfUnreadActivityLogs = numOfUnreadActivityLogs - numOfUnreadActivityLogsToFetch;
            const newActivityLogs = activityLogs.concat(data.activityLogs);
            setActivityLogs(newActivityLogs);
            setNumOfLoadedEntries(newActivityLogs.length);
            setNumOfUnreadActivityLogs(newNumOfUnreadActivityLogs);
            patchOrganization(organizationId, {
              numOfUnreadActivities: newNumOfUnreadActivityLogs,
            });
          } else {
            toast.error("Something went wrong");
          }
        })
        .catch(() => toast.error("Something went wrong"))
        .finally(() => setIsLoadingMore(false));
    });
  };

  if (typeof numOfUnreadActivityLogs !== "number") {
    return <div></div>;
  }
  return (
    <div className="pb-8">
      <ol className="flex flex-col space-y-4 items-center">
        {activityLogs.map((activityLog, index) => (
          <ActivityItem key={index} activityLog={activityLog} />
        ))}
      </ol>

      {activityLogs.length < totalNumOfActivityLogs && (
        <div className="flex justify-center items-center pt-4">
          <Button className="w-full max-w-[500px]" disabled={isLoadingMore} variant="secondary" onClick={onLoadMore}>
            {isLoadingMore ? "Loading more..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
};
