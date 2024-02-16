"use client";

import { useRouter } from "next/navigation";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LoginForm } from "./login-form";
import { CardWrapper } from "./card-wrapper";
import { capitalizeFirstLetter } from "@/lib/utils";
import { UserType } from "@prisma/client";

interface LoginButtonProps {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
  userType: "PROVIDER" | "PATIENT";
}

export const LoginButton = ({ children, mode = "redirect", asChild, userType }: LoginButtonProps) => {
  const router = useRouter();

  const onClick = () => {
    router.push(`/auth/${userType.toLocaleLowerCase()}-login`);
  };

  if (mode === "modal") {
    return (
      <Dialog>
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
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
};
