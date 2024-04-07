import { auth } from "@/auth";
import { Suspense } from "react";

import { ActivityList } from "./_components/activity-list";
import { Activity } from "lucide-react";
import { redirect } from "next/navigation";
import { getActivityLogs, getNumberOfUnreadActivityLogs } from "./data/activity";
import { SomethingNotFound } from "@/app/(public-routes)/upload-records/[token]/_components/something-not-found";
import { getOrganizationMemberByUserIdBase } from "../../../../../data/organization";

const ActivitySkeleton = ({ forEmptyState = false }: { forEmptyState?: boolean }) => {
  const activities = [1, 2, 3];

  return (
    <ol
      className="flex flex-col space-y-4 items-center w-full max-w-[750px]"
      style={{ animation: !forEmptyState ? "pulse 1.5s infinite" : "" }}
    >
      {activities.map((activity, index) => (
        <li
          key={index}
          className="flex items-center gap-x-2 w-full max-w-[750px] h-[80px] border border-secondary rounded-lg p-2"
        >
          <Activity className="w-5 h-5 text-muted-foreground" />
          <div className="w-full h-2 bg-muted-foreground rounded" />
        </li>
      ))}
    </ol>
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

  const organizationMember = await getOrganizationMemberByUserIdBase(organizationId);
  if (!organizationMember) {
    return <SomethingNotFound title="404 No organization found" href="provider-home" />;
  }

  const numOfUnreadActivityLogs = await getNumberOfUnreadActivityLogs(organizationId);
  const initialActivityLogsObj = await getActivityLogs(true, 0, organizationId);

  if (!initialActivityLogsObj?.totalNumOfActivityLogs || initialActivityLogsObj.totalNumOfActivityLogs === 0) {
    return (
      <div className="pt-20 px-4 flex flex-col gap-y-3 items-center">
        <ActivitySkeleton forEmptyState={true} />
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
    <div className="pt-20 px-4 flex flex-col gap-y-3 items-center">
      <Suspense fallback={<ActivitySkeleton />}>
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
