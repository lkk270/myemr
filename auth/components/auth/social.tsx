"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PATIENT_DEFAULT_LOGIN_REDIRECT, PROVIDER_DEFAULT_LOGIN_REDIRECT } from "@/routes";

import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { UserType } from "@prisma/client";

export const Social = () => {
  const user = useCurrentUser();
  const userType = user?.userType || "PATIENT";
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const redirectUrl = userType === UserType.PATIENT ? PATIENT_DEFAULT_LOGIN_REDIRECT : PROVIDER_DEFAULT_LOGIN_REDIRECT;
  const onClick = (provider: "google") => {
    signIn(provider, {
      callbackUrl: callbackUrl || redirectUrl,
    });
  };

  return (
    <div className="flex items-center w-full gap-x-2">
      <Button size="lg" className="w-full" variant="outline" onClick={() => onClick("google")}>
        <FcGoogle className="h-5 w-5" />
      </Button>
    </div>
  );
};
