"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { usePatientManageAccountModal } from "../../../auth/hooks/use-patient-manage-account-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

import { useSession } from "next-auth/react";
import { useWindowScroll } from "@/auth/hooks/use-window-scroll";
import { useMediaQuery } from "usehooks-ts";
import { Separator } from "../../ui/separator";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { AvatarButton } from "./avatar-button";
import { SettingsForm } from "./settings-form";
import { getPatient } from "@/data/user-for-profile";
import { usePatientForManageAccount } from "@/auth/hooks/use-patient-for-manage-account";
import { UploadProfilePictureButton } from "./upload-profile-picture-button";
import { DeleteProfilePictureButton } from "./delete-profile-picture-button";
import { Button } from "@/components/ui/button";
import { AvatarComponent } from "@/components/avatar-component";

export const PatientManageAccountModal = () => {
  const { data: session } = useSession();
  const user = useCurrentUser();
  const { patient, setPatient } = usePatientForManageAccount();
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

  useEffect(() => {
    const getPatientProfile = () => {
      if (!isOpen) return;
      startTransition(() => {
        getPatient().then((data) => {
          if (data) {
            setPatient(data);
            if (!!session && !!session.user && !session.user.image) {
              localStorage.setItem(`myEmrImageUrl${session.user?.id}`, data.imageUrl);
            }
          }
        });
      });
    };
    getPatientProfile();
  }, [isOpen]);

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
            <div id="account" style={{ height: "1250px" }} className="flex flex-col pt-5 gap-y-4">
              <div className="flex flex-col space-y-1.5">
                <h1 className="text-4xl font-bold">Account</h1>
                <h3 className="text-md text-muted-foreground">Manage your account information</h3>
              </div>
              <div className="flex flex-col gap-y-5">
                <div className="flex flex-col gap-y-8">
                  <div>
                    <h3 className="font-semibold pb-1">Profile</h3>
                    <Separator />
                  </div>
                  <div className="flex items-center gap-x-3">
                    <AvatarComponent avatarClassName="w-16 h-16" />
                    <div>{patient && `${patient?.firstName} ${patient?.lastName}`}</div>
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
                  {!user?.isOAuth && (
                    <div>
                      <div>
                        <h3 className="font-semibold">Security</h3>
                        <Separator />
                      </div>

                      <div className="flex pt-2">
                        <SettingsForm />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col justify-center">
                    <h3 className="font-semibold pb-1">Danger</h3>
                    <Separator />
                  </div>
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
