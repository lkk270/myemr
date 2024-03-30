"use client";

import { Folders } from "lucide-react";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { GenericNavigationMenu } from "@/components/generic-navigation-menu";
import { SearchBox } from "./search-box";
import { UserButton } from "@/components/user-button";
import { useMediaQuery } from "usehooks-ts";
import { Notifications } from "@/components/notifications";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
  numOfUnreadNotifications?: number;
}

export const Navbar = ({ isCollapsed, onResetWidth, numOfUnreadNotifications }: NavbarProps) => {
  const isMobile = useMediaQuery("(max-width: 450px)");
  const currentUserPermissions = useCurrentUserPermissions();

  return (
    <>
      <nav className="justify-between px-3 py-4 xs:py-2 w-full flex items-center gap-x-4">
        {isCollapsed && (
          <div className="flex items-center gap-x-4 xs:gap-x-6">
            <Logo showText={false} />
            <Folders role="button" onClick={onResetWidth} className="w-6 h-6" />
            {isMobile && <SearchBox />}
          </div>
        )}
        {/* {!isCollapsed && (
          <div className="flex items-center px-3">
            <SearchBox />
          </div>
        )} */}

        {!isMobile && (
          <div className="flex items-center">
            <SearchBox />
          </div>
        )}

        {/* <div className="flex-grow"></div> */}
        <div className="flex items-center gap-x-3">
          <GenericNavigationMenu />
          {currentUserPermissions.hasAccount && typeof numOfUnreadNotifications === "number" && (
            <Notifications numOfUnreadNotificationsParam={numOfUnreadNotifications} />
          )}
          <ModeToggle />
          <UserButton />
          {/* <UserButton afterSignOutUrl="/" /> */}
        </div>
      </nav>
    </>
  );
};
