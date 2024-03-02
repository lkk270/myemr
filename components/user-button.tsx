"use client";

import { FaUser } from "react-icons/fa";
import { Settings, LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { LogoutButton } from "../auth/components/auth/logout-button";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { Separator } from "@/components/ui/separator";
import { usePatientManageAccountModal } from "@/auth/hooks/use-patient-manage-account-modal";
import { AvatarComponent } from "./avatar-component";
import { planNames } from "@/lib/constants";

export const UserButton = () => {
  const { onOpen } = usePatientManageAccountModal();
  const user = useCurrentUser();
  const plan = user?.plan;
  const currentUserPermissions = extractCurrentUserPermissions(user);
  const isValidPatient = user?.email && currentUserPermissions.isPatient;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <AvatarComponent />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          "min-w-[375px] flex flex-col px-4 dark:bg-[#19191a] dark:border-none shadow-md",
          isValidPatient && "pt-5",
        )}
        align="end"
      >
        {isValidPatient && (
          <div className="flex flex-row gap-x-2 mb-4 items-center max-w-[375px]">
            <AvatarComponent avatarClassName="w-10 h-10" />
            <span className=" text-sm font-semibold break-all whitespace-normal">
              {capitalizeFirstLetter(user.email!)}
              {plan && !plan.includes("FREE") && (
                <span className="bg-gradient-to-r from-violet-400 to-[#4f5eff] bg-clip-text text-transparent">
                  {" "}
                  {planNames[plan].title} subscriber
                </span>
              )}
            </span>
          </div>
        )}
        {isValidPatient && (
          <DropdownMenuItem className="py-3" onClick={() => onOpen()}>
            <Settings className="h-4 w-4 mr-6" />
            Manage account & more
          </DropdownMenuItem>
        )}
        <LogoutButton>
          <DropdownMenuItem className="py-3">
            <LogOut className="h-4 w-4 mr-6" />
            Logout
          </DropdownMenuItem>
        </LogoutButton>
        <Separator className="mt-1" />
        <div className="py-2 flex flex-row justify-between text-xs font-semibold text-[#99a1f7]">
          <div role={"button"}>
            <a href="/">myemr © 2024</a>
          </div>
          <div className="flex flex-row gap-x-2">
            <div role={"button"}>
              <a href="/">Terms</a>
            </div>
            <div role={"button"}>
              <a href="/">Privacy</a>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
