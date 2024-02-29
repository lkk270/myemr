"use client";

import { useEffect, useRef, useState } from "react";
import { usePatientManageAccountModal } from "../../../auth/hooks/use-patient-manage-account-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

import { useSession } from "next-auth/react";
import { useWindowScroll } from "@/auth/hooks/use-window-scroll";
import { useMediaQuery } from "usehooks-ts";
import { Separator } from "../../ui/separator";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { SettingsForm } from "./settings-form";
import { UploadProfilePictureButton } from "./upload-profile-picture-button";
import { DeleteProfilePictureButton } from "./delete-profile-picture-button";
import { DeleteAccountButton } from "./delete-account-button";

import { Button } from "@/components/ui/button";
import { AvatarComponent } from "@/components/avatar-component";

export const PatientManageAccountModal = () => {
  const { data: session } = useSession();
  const user = useCurrentUser();
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
        className="dark:bg-[#19191a] shadow-md overflow-y-scroll max-h-[650px] max-w-[850px] w-full h-full flex"
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
            <div id="account" style={{ height: "875px" }} className="flex flex-col pt-5 gap-y-4">
              <div className="flex flex-col space-y-1.5">
                <h1 className="text-4xl font-bold">Account</h1>
                <h3 className="text-md text-muted-foreground">Manage your account information</h3>
              </div>
              <div className="flex flex-col gap-y-5">
                <div className="flex flex-col gap-y-5">
                  <div className="flex flex-col gap-y-3">
                    <div>
                      <h3 className="font-semibold pb-1">Profile</h3>
                      <Separator />
                    </div>
                    <div className="flex items-center gap-x-3">
                      <AvatarComponent avatarClassName="w-16 h-16" />
                      <div>{user?.email}</div>
                      <div className="flex flex-col gap-y-2">
                        <UploadProfilePictureButton asChild>
                          <Button variant={"secondary"} className="w-20 h-8">
                            Upload
                          </Button>
                        </UploadProfilePictureButton>
                        {user?.image && (
                          <DeleteProfilePictureButton asChild>
                            <Button className="w-20 h-8 text-sm bg-secondary hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]">
                              Delete
                            </Button>
                          </DeleteProfilePictureButton>
                        )}
                      </div>
                    </div>
                  </div>
                  {!user?.isOAuth && (
                    <div className="flex flex-col gap-y-5">
                      <div>
                        <h3 className="font-semibold">Security</h3>
                        <Separator />
                      </div>

                      <div className="flex">
                        <SettingsForm />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-y-5">
                    <div className="flex flex-col justify-center">
                      <h3 className="font-semibold pb-1">Danger</h3>
                      <Separator />
                    </div>
                    <div className="justify-between text-sm flex items-center gap-x-3">
                      <div className="flex flex-col">
                        <div className="font-semibold">Delete Account</div>
                        <div className="text-muted-foreground">Delete your account and all its associated data</div>
                      </div>
                      <div className="flex flex-col gap-y-2">
                        <DeleteAccountButton asChild>
                          <Button className="w-40 h-12 bg-[#f04337] hover:bg-[#d92d21] text-[#ffff]">
                            Delete Account
                          </Button>
                        </DeleteAccountButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="billing-plan" style={{ height: "850px" }}>
              <div className="flex flex-col space-y-1.5">
                <h1 className="text-4xl font-bold">Billing & Plan</h1>
                <h3 className="text-md text-muted-foreground">Manage your banking information and subscription</h3>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
