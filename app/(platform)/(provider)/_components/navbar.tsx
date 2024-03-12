"use client";

import { Folders } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";
import { UserButton } from "@/components/user-button";
import { OrganizationDropdown } from "./organization-dropdown";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  return (
    <>
      <nav className="justify-between px-3 py-4 xs:py-2 w-full flex items-center gap-x-4">
        {isCollapsed && (
          <div className="flex items-center gap-x-4 xs:gap-x-6">
            <Folders role="button" onClick={onResetWidth} className="w-6 h-6" />
            <Logo textColor="#4f5eff" />
          </div>
        )}
        <div className="flex items-center px-3"></div>
        <div className="flex items-center">
          <div className="flex items-center sm:flex gap-x-4">
            <OrganizationDropdown />
            <ModeToggle />
            <UserButton />
          </div>
        </div>
      </nav>
    </>
  );
};
