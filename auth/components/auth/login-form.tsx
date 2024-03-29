"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { LoginSchema } from "@/auth/schemas";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { login } from "@/auth/actions/login";
import { Spinner } from "@/components/loading/spinner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useShowTwoFactor } from "@/auth/hooks/use-show-two-factor";
interface LoginFormProps {
  userType: "PROVIDER" | "PATIENT";
}

export const LoginForm = ({ userType }: LoginFormProps) => {
  console.log(userType);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  let urlError = "";
  const searchParamError = searchParams.get("error");
  if (searchParamError) {
    if (searchParamError === "OAuthAccountNotLinked") {
      urlError = "Email is already being used through Google Sign in!";
    } else if (searchParamError === "AuthorizedCallbackError") {
      urlError =
        "Oops something went wrong - it's possible this email is already being used through traditional password sign in!";
    } else {
      urlError = "Oops something went wrong";
    }
  }
  const { showTwoFactor, setShowTwoFactor } = useShowTwoFactor();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      userType: userType,
    },
  });
  const { setValue } = form;
  useEffect(() => {
    setValue("userType", userType);
  }, [userType]);

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
        .catch(() => {
          setError("Something went wrong");
        });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {showTwoFactor && (
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-y-4 items-center pt-4">
                  <FormLabel htmlFor="inviteCode">Two factor code</FormLabel>
                  <div className="relative flex flex-row items-center justify-center gap-x-3 w-full">
                    <div className="flex justify-center">
                      <InputOTP
                        {...field}
                        onComplete={form.handleSubmit(onSubmit)}
                        disabled={isPending}
                        maxLength={6}
                        render={({ slots }) => (
                          <InputOTPGroup>
                            {slots.slice(0, 6).map((slot, index) => (
                              <InputOTPSlot key={index} {...slot} />
                            ))}
                          </InputOTPGroup>
                        )}
                      />
                    </div>
                    {isPending && (
                      <div className="absolute right-0 mr-6 flex-grow-0">
                        <Spinner size="lg" loaderType={"loader2"} />
                      </div>
                    )}
                  </div>
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
                      <Link href={`/auth/${userType.toLowerCase()}-reset`} onDragStart={(e) => e.preventDefault()}>
                        Forgot password?
                      </Link>
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
        <FormError message={error || urlError} />
        <FormSuccess message={success} />

        <Button disabled={isPending} type="submit" className="w-full">
          {showTwoFactor ? "Confirm" : "Login"}
        </Button>
      </form>
    </Form>
  );
};
