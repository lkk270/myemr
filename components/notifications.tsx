"use client";

import axios from "axios";

import { useState, useTransition } from "react";
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

type NotificationProps = {
  numOfUnreadNotificationsParam: number;
};

export const Notifications = ({ numOfUnreadNotificationsParam }: NotificationProps) => {
  const [isPending, startTransition] = useTransition();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalNumOfNotifications, setTotalNumOfNotifications] = useState(0);
  const [numOfLoadedEntries, setNumOfLoadedEntries] = useState(0);

  const [dataFetched, setDataFetched] = useState(false);
  const [numOfUnreadNotifications, setNumOfUnreadNotifications] = useState(numOfUnreadNotificationsParam);

  const onBellClick = () => {
    if (!dataFetched) {
      startTransition(() => {
        getNotifications(true, numOfUnreadNotifications, 0)
          .then((data) => {
            if (!!data && !!data.notifications) {
              setNotifications(data.notifications);
              setTotalNumOfNotifications(data.totalNumOfNotifications || 0);
              setNumOfLoadedEntries(data.notifications.length);
              setDataFetched(true);
              setNumOfUnreadNotifications(0);
            } else {
              console.log(data);
              toast.error("Something went wrong1");
            }
          })
          .catch(() => toast.error("Something went wrong2"));
      });
    }
  };

  const onLoadMore = () => {
    startTransition(() => {
      getNotifications(false, numOfUnreadNotifications, numOfLoadedEntries)
        .then((data) => {
          if (!!data && !!data.notifications) {
            const newNotifications = notifications.concat(data.notifications);
            setNotifications(newNotifications);
            setNumOfLoadedEntries(newNotifications.length);
          } else {
            toast.error("Something went wrong");
          }
        })
        .catch(() => toast.error("Something went wrong"));
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
              <Badge className="absolute bottom-0 justify-center w-4 h-4 text-[10px] text-white bg-red-500 mb-[10px] left-100">
                {numOfUnreadNotifications > 9 ? "9+" : numOfUnreadNotifications.toString()}
              </Badge>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="overflow-y-scroll w-96 max-h-[550px]">
        <DropdownMenuGroup>
          {isPending ? (
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
                    <span className="flex items-center mb-1 text-primary/40">
                      {new Date(item.createdAt).toLocaleString().split(",")[0]}
                      {!item.read && <Dot size={10} strokeWidth={24} className="ml-2 text-sky-500" />}
                    </span>
                    <span className="text-primary/80">{item.text}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
              );
            })
          )}
        </DropdownMenuGroup>
        {!isPending && notifications.length < totalNumOfNotifications && (
          <div className="flex items-center justify-between py-4 space-x-2">
            <div className="text-sm text-muted-foreground">
              Showing {notifications.length.toString()}/{totalNumOfNotifications.toString()} rows
            </div>
            <Button disabled={isPending} variant="outline" size="sm" onClick={onLoadMore}>
              {isPending ? "Loading more..." : "Load more"}
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
