"use client";

import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { AccessWithCodeButton } from "@/auth/components/auth/access-patient-with-code-button";
import { LoginButton } from "@/auth/components/auth/login-button";
import Link from "next/link";
export const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger className="sm:hidden flex">
        <Menu />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-60 p-0 pt-10 dark:bg-[#202021] bg-[#f5eff3] flex-col flex items-center gap-y-6"
      >
        <SheetClose asChild>
          <LoginButton mode="modal" asChild userType="PATIENT">
            <Button variant="gooeyLeftGhost" size="sm">
              Patient
            </Button>
          </LoginButton>
        </SheetClose>
        <SheetClose asChild>
          <LoginButton mode="modal" asChild userType="PROVIDER">
            <Button variant="gooeyLeftGhost" size="sm">
              Provider
            </Button>
          </LoginButton>
        </SheetClose>
        <SheetClose asChild>
          <AccessWithCodeButton asChild>
            <Button variant="gooeyLeftGhost" size="sm">
              Have a patient access Code?
            </Button>
          </AccessWithCodeButton>
        </SheetClose>
        <SheetClose asChild>
          <Link href="/pricing">
            <Button variant="gooeyLeftGhost" size="sm">
              <span className="text-sm">Pricing</span>
            </Button>
          </Link>
        </SheetClose>
        <div className="px-2 text-xs text-center text-primary/40">myemr © 2024</div>
      </SheetContent>
    </Sheet>
  );
};
