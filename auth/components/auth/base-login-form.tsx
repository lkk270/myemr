"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { LoginSchema } from "@/auth/schemas";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CardWrapper } from "./card-wrapper";
import { Button } from "@/components/ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { login } from "@/auth/actions/login";
import { UserType } from "@prisma/client";
import { capitalizeFirstLetter } from "@/lib/utils";
import { AccessPatientWithCodeForm } from "./access-patient-wth-code-form";
import { LoginForm } from "./login-form";

export const BaseLoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [userType, setUserType] = useState<UserType | "CODE">(callbackUrl?.includes("tpa-") ? "CODE" : "PATIENT");

  const handleUserTypeChange = (value: "PROVIDER" | "PATIENT") => {
    setUserType(value);
  };

  return (
    <CardWrapper
      headerLabel={userType === "CODE" ? "Access a Patient" : `Welcome Back ${capitalizeFirstLetter(userType)}`}
      headerSubtitle={userType === "CODE" ? "Enter the temporary access code given to you by your patient." : undefined}
      backButtonLabel={userType === "CODE" ? "Or create a provider account" : "Don't have an account?"}
      backButtonHref={userType === UserType.PATIENT ? "/auth/patient-register" : "/auth/provider-register"}
      showSocial={userType === UserType.PATIENT}
    >
      <ToggleGroup type="single" onValueChange={handleUserTypeChange} defaultValue={userType}>
        <ToggleGroupItem value={UserType.PATIENT}>Patient</ToggleGroupItem>
        <ToggleGroupItem value={UserType.PROVIDER}>Provider</ToggleGroupItem>
        <ToggleGroupItem value={"CODE"}>Code</ToggleGroupItem>
      </ToggleGroup>
      {userType === "CODE" ? <AccessPatientWithCodeForm /> : <LoginForm userType={userType} />}
    </CardWrapper>
  );
};
