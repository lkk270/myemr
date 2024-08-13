import { generateOrganizationActivityText } from "@/lib/utils";

import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OrganizationActivity } from "@prisma/client";
import { FaUser } from "react-icons/fa";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AccessTypePopover } from "./access-type-popover";
import { AllowedRoles } from "@/lib/constants";

const OrganizationActivityTypeMap = {
  PROVIDER_ADDED: { label: "Provider added", color: "bg-[#8a60f6]" },
  INVITE_ACCEPTED: { label: "Provider invite accepted", color: "bg-[#4a865a]" },
  ADDED_BY_PATIENT: { label: "Added by patient", color: "bg-sky-500" },
};
interface ActivityItemProps {
  activityLog: OrganizationActivity;
}

export const ActivityItem = ({ activityLog }: ActivityItemProps) => {
  const dynamicData = activityLog.dynamicData as any;
  const accessType = dynamicData["accessType"];
  const activityType = activityLog.type;
  const badgeObj = OrganizationActivityTypeMap[activityType];
  const activityHref =
    activityType === "PROVIDER_ADDED" || activityType === "INVITE_ACCEPTED"
      ? `/organization/${activityLog.organizationId}/members`
      : activityLog.href;
  const BaseActivityItem = () => {
    return (
      <li
        className={cn(
          !!activityHref && "hover:bg-secondary",
          "flex items-center gap-x-2 w-full max-w-[750px] border border-secondary rounded-lg p-2",
        )}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage style={{ objectFit: "cover" }} src={activityLog.imageUrl || ""} />
          <AvatarFallback className={cn(activityType === "ADDED_BY_PATIENT" ? "bg-[#c183fa]" : "bg-blue-600")}>
            <FaUser className="text-white" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-0.5">
          <p className="text-sm text-primary/90">{generateOrganizationActivityText(activityLog)} </p>
          <div className="flex flex-row gap-x-4 items-center">
            <p className="text-xs text-muted-foreground">
              {format(new Date(activityLog.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
            <Badge className={cn("hidden xs:flex max-w-60 text-xs", badgeObj.color, `hover:${badgeObj.color}`)}>
              {badgeObj.label}
            </Badge>
          </div>
        </div>
      </li>
    );
  };
  return !!activityHref ? (
    <div className="relative flex flex-col">
      <Link href={activityHref}>
        <BaseActivityItem />
      </Link>
      <div className="absolute right-0 bottom-0 mr-2 mb-2 flex items-center gap-x-2">
        {!!dynamicData && !!accessType && <AccessTypePopover accessType={dynamicData["accessType"] as AllowedRoles} />}
      </div>
    </div>
  ) : (
    <div className="relative flex flex-col">
      <BaseActivityItem />
      <div className="absolute right-0 bottom-0 mr-2 mb-2 flex items-center gap-x-2">
        {!!dynamicData && !!accessType && <AccessTypePopover accessType={dynamicData["accessType"] as AllowedRoles} />}
      </div>
    </div>
  );
};
