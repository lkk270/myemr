"use client";

import { FaUser } from "react-icons/fa";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/auth/hooks/use-current-user";

export const AvatarComponent = ({ avatarClassName = "w-8 h-8" }: { avatarClassName?: string }) => {
  const user = useCurrentUser();
  // console.log(user);

  return (
    <Avatar className={avatarClassName}>
      <AvatarImage src={user?.image || ""} />
      <AvatarFallback className="bg-sky-500">
        <FaUser className="text-white" />
      </AvatarFallback>
    </Avatar>
  );
};
