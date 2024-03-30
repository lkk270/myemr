"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { Menu } from "lucide-react";

export const MobileSidebar = () => {
  const triggerClassName = "mr-2 sm:hidden";
  return (
    <Sheet>
      <SheetTrigger className={triggerClassName}>
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-32 p-0 pt-10 bg-secondary">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};
