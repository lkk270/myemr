import { auth } from "@/auth";
import { Suspense } from "react";

import { ActivityList } from "./_components/activity-list";
import prismadb from "@/lib/prismadb";
import { Activity } from "lucide-react";
import { redirect } from "next/navigation";
import { getActivityLogs, getNumberOfUnreadActivityLogs } from "./data/activity";

const ActivitySkeleton = () => {
  // An array to map over. In this example, it simply determines the number of times the component is rendered.
  // This could also be an array of objects, each representing different data for individual activities.
  const activities = [1, 2, 3];

  return (
    <div className="space-y-6 w-full max-w-[750px]">
      {activities.map((activity, index) => (
        <div
          key={index}
          className="w-full flex items-center justify-between p-4 bg-secondary rounded-lg shadow gap-x-4"
        >
          <Activity className="w-5 h-5 text-muted-foreground" />
          <div className="w-full h-2 bg-muted-foreground rounded" />
        </div>
      ))}
    </div>
  );
};
interface ActivityLogPageProps {
  params: {
    organizationId: string;
  };
}

const ActivityLogPage = async ({ params }: ActivityLogPageProps) => {
  const organizationId = params.organizationId;

  const session = await auth();
  const user = session?.user;

  if (!session || !user || user.userType !== "PROVIDER") {
    return redirect("/");
  }

  const numOfUnreadActivityLogs = await getNumberOfUnreadActivityLogs(organizationId);
  const initialActivityLogsObj = await getActivityLogs(true, 0, organizationId);

  console.log(numOfUnreadActivityLogs);
  console.log(initialActivityLogsObj);

  if (!initialActivityLogsObj?.totalNumOfActivityLogs || initialActivityLogsObj.totalNumOfActivityLogs === 0) {
    return (
      <div className="justify-center flex flex-col items-center min-h-screen px-4">
        <ActivitySkeleton />
        <div className="mt-10 text-center">
          <h2 className="text-xl font-semibold">This organization currently has no activity logs.</h2>
          <p className="mt-2 text-muted-foreground">
            Activities such as patients adding this organization will be displayed here.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="pt-20 px-4 flex flex-col gap-y-3">
      <Suspense
        fallback={
          <div className="flex flex-col space-y-4 mt-4 items-center">
            <ActivitySkeleton />
          </div>
        }
      >
        <ActivityList
          organizationId={organizationId}
          initialNumOfUnreadActivityLogs={numOfUnreadActivityLogs}
          initialActivityLogsObj={initialActivityLogsObj}
        />
      </Suspense>
    </div>
  );
};

export default ActivityLogPage;
