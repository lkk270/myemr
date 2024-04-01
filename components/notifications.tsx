"use client";

import { format } from "date-fns";

import { useState, startTransition } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Bell, Dot } from "lucide-react";
import { Notification } from "@prisma/client";
import { getNotifications } from "@/lib/data/notifications";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { NotificationsSkeleton } from "@/components/loading/notifications-skeleton";
import { toast } from "sonner";
import { generatePatientNotificationText } from "@/lib/utils";

type NotificationProps = {
  numOfUnreadNotificationsParam: number;
};

export const Notifications = ({ numOfUnreadNotificationsParam }: NotificationProps) => {
  const [isLoadingBase, setIsLoadingBase] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalNumOfNotifications, setTotalNumOfNotifications] = useState(0);
  const [numOfLoadedEntries, setNumOfLoadedEntries] = useState(0);

  const [dataFetched, setDataFetched] = useState(false);
  const [numOfUnreadNotifications, setNumOfUnreadNotifications] = useState(numOfUnreadNotificationsParam);

  const onBellClick = () => {
    if (!dataFetched) {
      setIsLoadingBase(true);
      startTransition(() => {
        const numOfUnreadNotificationsToFetch = Math.min(5, Math.max(0, numOfUnreadNotifications));
        getNotifications(true, 0)
          .then((data) => {
            if (!!data && !!data.notifications) {
              setNotifications(data.notifications);
              setTotalNumOfNotifications(data.totalNumOfNotifications || 0);
              setNumOfLoadedEntries(data.notifications.length);
              setDataFetched(true);
              setNumOfUnreadNotifications(numOfUnreadNotifications - numOfUnreadNotificationsToFetch);
            } else {
              console.log(data);
              toast.error("Something went wrong1");
            }
          })
          .catch(() => toast.error("Something went wrong"))
          .finally(() => setIsLoadingBase(false));
      });
    }
  };

  const onLoadMore = () => {
    setIsLoadingMore(true);
    startTransition(() => {
      const numOfUnreadNotificationsToFetch = Math.min(5, Math.max(0, numOfUnreadNotifications));
      getNotifications(false, numOfLoadedEntries)
        .then((data) => {
          if (!!data && !!data.notifications) {
            const newNotifications = notifications.concat(data.notifications);
            setNotifications(newNotifications);
            setNumOfLoadedEntries(newNotifications.length);
            setNumOfUnreadNotifications(numOfUnreadNotifications - numOfUnreadNotificationsToFetch);
          } else {
            toast.error("Something went wrong");
          }
        })
        .catch(() => toast.error("Something went wrong"))
        .finally(() => setIsLoadingMore(false));
    });
  };

  if (typeof numOfUnreadNotifications !== "number") {
    return <div></div>;
  }
  return (
    <DropdownMenu onOpenChange={onBellClick}>
      <DropdownMenuTrigger asChild>
        <Button className="px-0 py-0" variant="ghost2">
          <div className="relative">
            <Bell className="w-5 h-5" />
            {numOfUnreadNotifications > 0 && (
              <Badge className="hover:bg-red-500 absolute bottom-0 justify-center w-4 h-4 text-[10px] text-white bg-red-500 mb-[10px] left-100">
                {numOfUnreadNotifications > 9 ? "9+" : numOfUnreadNotifications.toString()}
              </Badge>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="overflow-y-scroll w-96 max-h-[550px]">
        <DropdownMenuGroup>
          {isLoadingBase ? (
            <NotificationsSkeleton />
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-3 text-center text-primary/60 gap-y-4 pb-4">
              <h2 className="text-lg font-bold">No Notifications</h2>
              <Image draggable={false} height={200} width={200} src="/empty1.svg" alt="Empty" />
            </div>
          ) : (
            notifications.map((item, index) => {
              return (
                <div key={index}>
                  <DropdownMenuItem className="flex flex-col items-start">
                    <span className="flex flex-row items-center mb-1 text-xs text-muted-foreground">
                      {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      {!item.read && (
                        <span className="ml-2 flex-shrink-0">
                          <Dot className="text-sky-500" size={10} strokeWidth={50} />
                        </span>
                      )}
                    </span>
                    <span className="text-primary/80">{generatePatientNotificationText(item)}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
              );
            })
          )}
        </DropdownMenuGroup>
        {!isLoadingBase && notifications.length < totalNumOfNotifications && (
          <div className="flex items-center justify-end py-[9px] space-x-2 pr-4">
            {/* <div className="text-sm text-muted-foreground">
              Showing {notifications.length.toString()}/{totalNumOfNotifications.toString()} rows
            </div> */}
            <Button disabled={isLoadingMore} variant="outline" size="sm" onClick={onLoadMore}>
              {isLoadingMore ? "Loading more..." : "Load more"}
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
