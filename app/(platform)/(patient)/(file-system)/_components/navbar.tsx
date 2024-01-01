"use client";

import { MenuIcon } from "lucide-react";
// import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { GenericNavigationMenu } from "@/components/generic-navigation-menu";
import { navRoutes } from "@/lib/constants";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  return (
    <>
      <nav className="px-3 py-2 w-full flex items-center gap-x-4">
        {isCollapsed && (
          <div className="flex items-center gap-x-2">
            <MenuIcon role="button" onClick={onResetWidth} />
            <Logo showText={false} />
          </div>
        )}

        <div className="flex-grow"></div>
        <div className="flex items-center gap-x-2">
          <GenericNavigationMenu navRoutes={navRoutes} />
          <ModeToggle />
          {/* <UserButton afterSignOutUrl="/" /> */}
        </div>
      </nav>
    </>
  );
};
