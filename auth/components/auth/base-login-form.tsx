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

export const BaseLoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email is already being used through Google Sign in!"
      : searchParams.get("error") === "AuthorizedCallbackError"
      ? "Email is already being used through email & password sign in!"
      : "";

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  //   const [userType, setUserType] = useState<UserType>(UserType.PATIENT);
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      userType: UserType.PATIENT,
    },
  });

  const { register, watch, setValue, handleSubmit, control } = form;
  const watchedUserType = watch("userType");

  const handleUserTypeChange = (value: "PROVIDER" | "PATIENT") => {
    setValue("userType", value);
  };

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      login(values, callbackUrl)
        .then((data) => {
          if (data?.error) {
            // form.reset();
            setError(data.error);
          }

          if (data?.success) {
            form.reset();
            setSuccess(data.success);
          }

          if (data?.twoFactor) {
            setShowTwoFactor(true);
          }
        })
        .catch(() => setError("Something went wrong"));
    });
  };

  return (
    <CardWrapper
      headerLabel={
        watchedUserType === "CODE" ? "Access a Patient" : `Welcome Back ${capitalizeFirstLetter(watchedUserType)}`
      }
      headerSubtitle={
        watchedUserType === "CODE" ? "Enter the temporary access code given to you by your patient." : undefined
      }
      backButtonLabel={watchedUserType === "CODE" ? "Or create a provider account" : "Don't have an account?"}
      backButtonHref={watchedUserType === UserType.PATIENT ? "/auth/patient-register" : "/auth/provider-register"}
      showSocial={watchedUserType === UserType.PATIENT}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <ToggleGroup {...field} type="single" onValueChange={handleUserTypeChange}>
                    <ToggleGroupItem value={UserType.PATIENT}>Patient</ToggleGroupItem>
                    <ToggleGroupItem value={UserType.PROVIDER}>Provider</ToggleGroupItem>
                    <ToggleGroupItem value={"CODE"}>Code</ToggleGroupItem>
                  </ToggleGroup>
                </FormItem>
              )}
            />
            {watchedUserType === "CODE" ? (
              <AccessPatientWithCodeForm />
            ) : (
              <>
                {showTwoFactor && (
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Two Factor Code</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isPending} placeholder="123456" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {!showTwoFactor && (
                  <>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isPending} placeholder="john.doe@example.com" type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isPending} placeholder="******" type="password" />
                          </FormControl>
                          <Button size="sm" variant="link" asChild className="px-0 font-normal">
                            <Link
                              href={`/auth/${watchedUserType.toLowerCase()}-reset`}
                              onDragStart={(e) => e.preventDefault()}
                            >
                              Forgot password?
                            </Link>
                          </Button>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </>
            )}
          </div>
          {watchedUserType !== "CODE" && (
            <>
              <FormError message={error || urlError} />
              <FormSuccess message={success} />
              <Button disabled={isPending} type="submit" className="w-full">
                {showTwoFactor ? "Confirm" : "Login"}
              </Button>
            </>
          )}
        </form>
      </Form>
    </CardWrapper>
  );
};
