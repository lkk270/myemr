"use client";

import { Building2 } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { usePathname } from "next/navigation";
import { UserButton } from "@/components/user-button";
import { OrganizationDropdown } from "./organization-dropdown";
import { useOrganizationStore } from "./hooks/use-organizations";
import { Notifications } from "@/components/notifications";
import { useMediaQuery } from "usehooks-ts";
interface NavbarProps {
  numOfUnreadNotifications: number;
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export const Navbar = ({ isCollapsed, onResetWidth, numOfUnreadNotifications }: NavbarProps) => {
  const pathName = usePathname();
  const { organizations } = useOrganizationStore();
  const isMobile = useMediaQuery("(max-width: 365px)");
  return (
    <>
      <nav className="justify-between px-3 py-4 w-full flex items-center gap-x-4">
        {isCollapsed && (
          <div className="flex items-center gap-x-4 xs:gap-x-6">
            <Building2 role="button" onClick={onResetWidth} className="w-6 h-6" />
            {/* <Logo textColor="#4f5eff" /> */}
          </div>
        )}
        <div className="hidden items-center px-3 xs:flex"></div>
        <div className="flex items-center">
          <div className="flex items-center gap-x-4">
            {pathName !== "/provider-home" && organizations.length > 0 && <OrganizationDropdown />}
            <Notifications numOfUnreadNotificationsParam={numOfUnreadNotifications} />
            {!isMobile && <ModeToggle />}
            <UserButton />
          </div>
        </div>
      </nav>
    </>
  );
};
