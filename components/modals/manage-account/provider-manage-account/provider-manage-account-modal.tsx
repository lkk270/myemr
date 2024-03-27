"use client";

import { useEffect, useRef, useState } from "react";
import { useProviderManageAccountModal } from "../../../../auth/hooks/use-provider-manage-account-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

import { useWindowScroll } from "@/auth/hooks/use-provider-window-scroll";
import { useMediaQuery } from "usehooks-ts";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { SettingsForm } from "../_components/settings-form";
import { UploadProfilePictureButton } from "../_components/upload-profile-picture-button";
import { DeleteProfilePictureButton } from "@/components/modals/manage-account/_components/delete-profile-picture-button";
import { DeleteAccountButton } from "./delete-account-button";

import { Button } from "@/components/ui/button";
import { AvatarComponent } from "@/components/avatar-component";
import { FeedbackForm } from "../_components/feedback-form";

export const ProviderManageAccountModal = () => {
  const user = useCurrentUser();
  const [isProfilePictureLoading, setIsProfilePictureLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isMounted, setIsMounted] = useState(false);
  const { isOpen, onOpen, onClose, defaultScrollTo } = useProviderManageAccountModal();
  // const activeSection = "";
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeSection = useWindowScroll(scrollContainerRef, ["account", "feedback-form"]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isMounted && !!defaultScrollTo) {
      setTimeout(() => {
        scrollToSection(defaultScrollTo);
      }, 500);
    }
  }, [isOpen, isMounted]);

  if (!isMounted || !scrollContainerRef) {
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
              onClick={() => scrollToSection("feedback-form")}
              className={cn(
                "transition-colors flex items-center justify-start",
                activeSection === "feedback-form" ? "bg-secondary" : "bg-transparent",
              )}
            >
              <div className="flex items-center gap-x-2">
                <MessageCircle />
                <span>Feedback</span>
              </div>
            </Button>
          </div>
        )}
        <div className="w-[675px]">
          <div className="flex flex-col gap-x-4 pl-2">
            <div
              id="account"
              style={{ height: user?.isOAuth ? "420px" : "1010px" }}
              className="flex flex-col pt-5 gap-y-4"
            >
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
                      <AvatarComponent isLoading={isProfilePictureLoading} avatarClassName="w-16 h-16" />
                      <div className="hidden xs:flex">{user?.email}</div>
                      <div className="flex flex-col gap-y-2">
                        <UploadProfilePictureButton setIsProfilePictureLoading={setIsProfilePictureLoading} asChild>
                          <Button variant={"secondary"} className="w-20 h-8">
                            Upload
                          </Button>
                        </UploadProfilePictureButton>
                        {user?.image && (
                          <DeleteProfilePictureButton setIsProfilePictureLoading={setIsProfilePictureLoading} asChild>
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
                      <div className="flex flex-col break-words whitespace-normal">
                        <div className="font-semibold">Delete Account</div>
                        <div className="text-muted-foreground">Delete your account and all its associated data</div>
                      </div>
                      <div className="flex flex-col gap-y-2">
                        <DeleteAccountButton asChild>
                          <Button className="bg-[#f04337] hover:bg-[#d92d21] text-[#ffff]">Delete Account</Button>
                        </DeleteAccountButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-y-5" id="feedback-form" style={{ minHeight: "600px" }}>
              <div className="flex flex-col space-y-1.5">
                <h1 className="text-4xl font-bold">Feedback</h1>
                <h3 className="text-md text-muted-foreground">
                  If you&apos;d like to suggest features, improvements, or report a bug you can do so here anonymously.
                </h3>
              </div>
              <FeedbackForm />
            </div>
          </div>
          <div className="text-center items-center text-sm font-semibold pb-2 text-muted-foreground">
            myemr © 2024 | made with ❤️
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
