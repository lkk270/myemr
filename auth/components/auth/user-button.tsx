"use client";

import { FaUser } from "react-icons/fa";
import { ExitIcon } from "@radix-ui/react-icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { LogoutButton } from "./logout-button";
import { capitalizeFirstLetter } from "@/lib/utils";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const UserButton = () => {
  const user = useCurrentUser();
  const currentUserPermissions = extractCurrentUserPermissions(user);

  const AvatarComponent = ({
    image,
    avatarClassName = "w-8 h-8",
  }: {
    image?: string | null;
    avatarClassName?: string;
  }) => {
    return (
      <Avatar className={avatarClassName}>
        <AvatarImage src={image || ""} />
        <AvatarFallback className="bg-sky-500">
          <FaUser className="text-white" />
        </AvatarFallback>
      </Avatar>
    );
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="pl-3">
        <AvatarComponent image={user?.image} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[375px] p-6" align="end">
        {user?.email && currentUserPermissions.isPatient && (
          <div className="flex flex-row gap-x-2 mb-4 items-center">
            <AvatarComponent image={user?.image} avatarClassName="w-10 h-10" />
            <span>{capitalizeFirstLetter(user.email)}</span>
          </div>
        )}
        <LogoutButton>
          <DropdownMenuItem>
            <ExitIcon className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </LogoutButton>
        <LogoutButton>
          <DropdownMenuItem>
            <ExitIcon className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
