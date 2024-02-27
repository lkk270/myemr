"use client";

import { useEffect, useRef, useState } from "react";
import { usePatientManageAccountModal } from "../../auth/hooks/use-patient-manage-account-modal";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { cn } from "@/lib/utils";

import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { Button } from "../ui/button";
import { useWindowScroll } from "@/auth/hooks/use-window-scroll";

export const PatientManageAccountModal = () => {
  const currentUserPermissions = useCurrentUserPermissions();

  const [isMounted, setIsMounted] = useState(false);

  const toggle = usePatientManageAccountModal((store) => store.toggle);
  const isOpen = usePatientManageAccountModal((store) => store.isOpen);
  const onClose = usePatientManageAccountModal((store) => store.onClose);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeSection = useWindowScroll(scrollContainerRef, ["account", "billing-plan"]);
  console.log(activeSection);

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
        className="overflow-y-scroll max-h-[650px] max-w-[850px] w-full h-full flex"
      >
        <div className="w-[175px] flex flex-col gap-y-4 pr-4 sticky top-0">
          <Button
            variant="secondary"
            className={cn("transition-colors", activeSection === "account" ? "bg-secondary" : "bg-transparent")}
            onClick={() => scrollToSection("account")}

            // onClick={() => scrollTo({ left: 0, top: 2000, behavior: "smooth" })}
          >
            Account
          </Button>
          <Button
            variant="secondary"
            onClick={() => scrollToSection("billing-plan")}
            className={cn("transition-colors", activeSection === "billing-plan" ? "bg-secondary" : "bg-transparent")}
          >
            Billing/Plan
          </Button>
        </div>
        <div>
          <div className="flex flex-col gap-x-4">
            <div id="account" style={{ height: "550px" }} className="pt-5">
              Account section content
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
