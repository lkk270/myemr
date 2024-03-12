"use client";

import { FaUser } from "react-icons/fa";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const AvatarComponent = ({ avatarClassName = "w-8 h-8" }: { avatarClassName?: string }) => {
  const user = useCurrentUser();
  const currentUserPermissions = extractCurrentUserPermissions(user);
  // console.log(user);

  return (
    <Avatar className={avatarClassName}>
      <AvatarImage src={currentUserPermissions.hasAccount ? user?.image || "" : ""} />
      <AvatarFallback className="bg-sky-500">
        <FaUser className="text-white" />
      </AvatarFallback>
    </Avatar>
  );
};
