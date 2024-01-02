"use client";

import { useRouter } from "next/navigation";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { UserType } from "@prisma/client";
import { RegisterForm } from "./register-form";

interface LoginButtonProps {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
  userType: UserType;
}

export const RegisterButton = ({ children, mode = "redirect", asChild, userType }: LoginButtonProps) => {
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
          <RegisterForm userType={userType} />
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
