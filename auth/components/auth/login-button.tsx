"use client";

import { useRouter } from "next/navigation";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerTrigger } from "@/components/ui/drawer";
import { LoginForm } from "./login-form";
import { CardWrapper } from "./card-wrapper";
import { capitalizeFirstLetter } from "@/lib/utils";
import { UserType } from "@prisma/client";

import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Button } from "@/components/ui/button";

interface LoginButtonProps {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
  userType: "PROVIDER" | "PATIENT";
}

export const LoginButton = ({ children, mode = "redirect", asChild, userType }: LoginButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const onClick = () => {
    router.push(`/auth/${userType.toLocaleLowerCase()}-login`);
  };

  if (mode === "modal") {
    if (isDesktop) {
      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
          <DialogContent className="p-0 bg-transparent border-none rounded-lg">
            <CardWrapper
              headerLabel={`Welcome Back ${capitalizeFirstLetter(userType)}`}
              backButtonLabel="Don't have an account?"
              backButtonHref={userType === UserType.PATIENT ? "/auth/patient-register" : "/auth/provider-register"}
              showSocial={userType === UserType.PATIENT}
            >
              <LoginForm userType={userType} />
            </CardWrapper>
          </DialogContent>
        </Dialog>
      );
    }
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent>
          <CardWrapper
            mode="drawer"
            headerLabel={`Welcome Back ${capitalizeFirstLetter(userType)}`}
            backButtonLabel="Don't have an account?"
            backButtonHref={userType === UserType.PATIENT ? "/auth/patient-register" : "/auth/provider-register"}
            showSocial={userType === UserType.PATIENT}
          >
            <LoginForm userType={userType} />
          </CardWrapper>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
};
