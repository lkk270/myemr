"use client";

import Link from "next/link";
// import { UserButton } from "@clerk/nextjs";
import { Ban, Bell } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";
import { UserButton } from "@/auth/components/auth/user-button";
// import { MobileSidebar } from "@/components/headers/mobile-sidebar";
// import { Notifications } from "@/components/notifications";

// const font = Poppins({
//   weight: '600',
//   subsets: ['latin'],
// });

export const MainNavbar = () => {
  return (
    <div className="fixed z-50 flex items-center justify-between w-full h-16 px-4 py-2 border-b border-primary/10 ">
      <Logo textColor="#4f5eff" />
      <div className="flex items-center">
        <div className="flex items-center sm:flex gap-x-4">
          <ModeToggle />
          <UserButton />
          {/* <UserButton afterSignOutUrl="/" /> */}
        </div>
      </div>
    </div>
  );
};
