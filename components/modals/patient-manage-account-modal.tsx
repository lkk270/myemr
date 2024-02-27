"use client";

import { useEffect, useRef, useState } from "react";
import { usePatientManageAccountModal } from "../../auth/hooks/use-patient-manage-account-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { Button } from "../ui/button";
import { useWindowScroll } from "@/auth/hooks/use-window-scroll";
import { useMediaQuery } from "usehooks-ts";
import { Separator } from "../ui/separator";
import { useCurrentUser } from "@/auth/hooks/use-current-user";

export const PatientManageAccountModal = () => {
  const user = useCurrentUser();
  console.log(user);
  const currentUserPermissions = useCurrentUserPermissions();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isMounted, setIsMounted] = useState(false);

  const toggle = usePatientManageAccountModal((store) => store.toggle);
  const isOpen = usePatientManageAccountModal((store) => store.isOpen);
  const onClose = usePatientManageAccountModal((store) => store.onClose);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeSection = useWindowScroll(scrollContainerRef, ["account", "billing-plan"]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        ref={scrollContainerRef}
        className="dark:bg-[#19191a] dark:border-none shadow-md overflow-y-scroll max-h-[650px] max-w-[850px] w-full h-full flex"
      >
        {!isMobile && (
          <div className="w-[175px] flex flex-col gap-y-4 pr-6 sticky top-0 border-r border-secondary">
            <Button
              variant="secondary"
              className={cn(
                "transition-colors flex items-center justify-start",
                activeSection === "account" ? "bg-secondary" : "bg-transparent",
              )}
              onClick={() => scrollToSection("account")}
            >
              <div className="flex items-center gap-x-2">
                <User />
                <span>Account</span>
              </div>
            </Button>
            <Button
              variant="secondary"
              onClick={() => scrollToSection("billing-plan")}
              className={cn(
                "transition-colors flex items-center justify-start",
                activeSection === "billing-plan" ? "bg-secondary" : "bg-transparent",
              )}
            >
              <div className="flex items-center gap-x-2">
                <Landmark />
                <span>Billing/Plan</span>
              </div>
            </Button>
          </div>
        )}
        <div className="w-[675px]">
          <div className="flex flex-col gap-x-4 pl-2">
            <div id="account" style={{ height: "550px" }} className="flex flex-col pt-5 gap-y-4">
              <div className="flex flex-col space-y-1.5">
                <h1 className="text-4xl font-bold">Account</h1>
                <h3 className="text-md text-muted-foreground">Manage your account information</h3>
              </div>
              <div>
                <div>
                  <h3 className="font-semibold pb-1">Profile</h3>
                  <Separator />
                </div>
                <div>
                  <h3 className="font-semibold pb-1">Email Address</h3>
                  <Separator />
                </div>
                <div>
                  <h3 className="font-semibold pb-1">Danger</h3>
                  <Separator />
                </div>
              </div>
            </div>
            <div id="billing-plan" style={{ height: "500px" }}>
              Billing/Plan section content
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
