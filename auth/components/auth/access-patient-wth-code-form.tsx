"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { AccessPatientWithCodeSchema } from "@/auth/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { accessPatientWithCode } from "@/auth/actions/access-patient-with-code";
import { Spinner } from "@/components/loading/spinner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export const AccessPatientWithCodeForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof AccessPatientWithCodeSchema>>({
    resolver: zodResolver(AccessPatientWithCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = (values: z.infer<typeof AccessPatientWithCodeSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      accessPatientWithCode(values, "callbackUrl")
        .then((data) => {
          if (data?.error) {
            setError(data.error);
            form.reset();
          }
        })
        .catch(() => setError("Something went wrong"));
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-y-4 items-center">
              <FormLabel htmlFor="inviteCode">Access code</FormLabel>
              <div className="relative flex flex-row items-center justify-center w-full">
                <div className="flex justify-center">
                  <InputOTP
                    {...field}
                    onComplete={form.handleSubmit(onSubmit)}
                    disabled={isPending}
                    maxLength={7}
                    render={({ slots }) => (
                      <InputOTPGroup>
                        {slots.slice(0, 7).map((slot, index) => (
                          <InputOTPSlot key={index} {...slot} />
                        ))}
                      </InputOTPGroup>
                    )}
                  />
                </div>
                {isPending && (
                  <div className="absolute right-0 flex-grow-0">
                    <Spinner size="lg" loaderType={"loader2"} />
                  </div>
                )}
              </div>
            </FormItem>
          )}
        />

        <FormError message={error} />
        <FormSuccess message={success} />
        {/* <Button disabled={isPending} type="submit" className="w-full flex justify-center py-2">
          Go
        </Button> */}
      </form>
    </Form>
  );
};
