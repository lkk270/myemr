"use client";

import { useRouter } from "next/navigation";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LoginForm } from "./login-form";
import { UserType } from "@prisma/client";

interface LoginButtonProps {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
  userType: UserType;
}

export const LoginButton = ({ children, mode = "redirect", asChild, userType }: LoginButtonProps) => {
  const router = useRouter();

  const onClick = () => {
    if (userType === UserType.PATIENT) {
      router.push("/auth/patient-login");
    } else {
      router.push("/auth/provider-login");
    }
  };

  if (mode === "modal") {
    return (
      <Dialog>
        <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
        <DialogContent className="p-0 bg-transparent border-none">
          <LoginForm userType={userType} />
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
