"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CardWrapper } from "./card-wrapper";
import { useShowTwoFactor } from "@/auth/hooks/use-show-two-factor";
import { UserType } from "@prisma/client";
import { capitalizeFirstLetter } from "@/lib/utils";
import { AccessPatientWithCodeForm } from "./access-patient-wth-code-form";
import { LoginForm } from "./login-form";

export const BaseLoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const { showTwoFactor } = useShowTwoFactor();
  const [userType, setUserType] = useState<UserType | "CODE">(callbackUrl?.includes("tpa-") ? "CODE" : "PATIENT");

  const handleUserTypeChange = (value: "PROVIDER" | "PATIENT") => {
    setUserType(value);
  };

  return (
    <CardWrapper
      // headerLabel={userType === "CODE" ? "Access a Patient" : `Welcome Back ${capitalizeFirstLetter(userType)}`}
      // headerSubtitle={userType === "CODE" ? "Enter the temporary access code given to you by your patient." : undefined}
      backButtonLabel={userType === "CODE" ? "Or create a provider account" : "Don't have an account?"}
      backButtonHref={userType === UserType.PATIENT ? "/auth/patient-register" : "/auth/provider-register"}
      showSocial={userType === UserType.PATIENT}
    >
      {!showTwoFactor && (
        <ToggleGroup className="py-5" type="single" onValueChange={handleUserTypeChange} defaultValue={userType}>
          <ToggleGroupItem value={UserType.PATIENT}>Patient</ToggleGroupItem>
          <ToggleGroupItem value={UserType.PROVIDER}>Provider</ToggleGroupItem>
          <ToggleGroupItem value={"CODE"}>Code</ToggleGroupItem>
        </ToggleGroup>
      )}
      {userType === "CODE" ? <AccessPatientWithCodeForm /> : <LoginForm userType={userType} />}
    </CardWrapper>
  );
};
