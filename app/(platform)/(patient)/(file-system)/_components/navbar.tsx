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
import { usePathname } from "next/navigation";
import { useOrganizationStore } from "@/app/(platform)/(provider)/(organization)/_components/hooks/use-organizations";
import { OrganizationDropdown } from "@/app/(platform)/(provider)/(organization)/_components/organization-dropdown";
import { cn } from "@/lib/utils";
interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
  numOfUnreadNotifications?: number;
}

export const Navbar = ({ isCollapsed, onResetWidth, numOfUnreadNotifications }: NavbarProps) => {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 450px)");
  const isMobile2 = useMediaQuery("(max-width: 550px)");
  const { organizations } = useOrganizationStore();
  const currentUserPermissions = useCurrentUserPermissions();

  const isIconVisibleForMobile = !isMobile2 && currentUserPermissions.isProvider;

  return (
    <>
      <nav
        className={cn(
          "justify-between px-1 xxs:px-3 py-2 xs:py-4 w-full flex items-center",
          isIconVisibleForMobile && "gap-x-1 xxs:gap-x-2 xs:gap-x-4",
        )}
      >
        {isCollapsed && (
          <div className="flex items-center gap-x-2 xxs:gap-x-3 xs:gap-x-6">
            {isIconVisibleForMobile && <Logo showText={false} />}
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
        <div className="flex items-center gap-x-2 xxs:gap-x-3">
          <GenericNavigationMenu splitRoute={"/file"} />
          {currentUserPermissions.isProvider && organizations.length > 0 && <OrganizationDropdown />}
          {isIconVisibleForMobile &&
            currentUserPermissions.hasAccount &&
            typeof numOfUnreadNotifications === "number" && (
              <Notifications numOfUnreadNotificationsParam={numOfUnreadNotifications} />
            )}
          {isIconVisibleForMobile && <ModeToggle />}
          <UserButton />
          {/* <UserButton afterSignOutUrl="/" /> */}
        </div>
      </nav>
    </>
  );
};
