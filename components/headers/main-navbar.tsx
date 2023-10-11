"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Ban, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
// import { MobileSidebar } from "@/components/headers/mobile-sidebar";
// import { Notifications } from "@/components/notifications";

// const font = Poppins({
//   weight: '600',
//   subsets: ['latin'],
// });

interface MainNavbarProps {}

export const MainNavbar = () => {
  return (
    <div className="fixed z-50 flex items-center justify-between w-full h-16 px-4 py-2 border-b border-primary/10 ">
      <div className="flex items-center">
        <div className="px-3">
          <Link href="/home">emridoc</Link>
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center sm:flex gap-x-4">
          <ModeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
};
