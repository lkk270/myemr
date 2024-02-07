"use client";

import { Folders, Search } from "lucide-react";
// import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { GenericNavigationMenu } from "@/components/generic-navigation-menu";
import { navRoutes } from "@/lib/constants";
import { SearchBox } from "./search-box";
import { UserButton } from "@/auth/components/auth/user-button";
import { useMediaQuery } from "usehooks-ts";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const isMobile = useMediaQuery("(max-width: 450px)");

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
        <div className="flex items-center">
          <GenericNavigationMenu navRoutes={navRoutes} />
          <ModeToggle />
          <UserButton />
          {/* <UserButton afterSignOutUrl="/" /> */}
        </div>
      </nav>
    </>
  );
};
