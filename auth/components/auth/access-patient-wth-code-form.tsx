"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { AccessPatientWithCodeSchema } from "@/auth/schemas";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { accessPatientWithCode } from "@/auth/actions/access-patient-with-code";

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
    console.log("IN 29");
    setError("");
    setSuccess("");

    startTransition(() => {
      accessPatientWithCode(values, "callbackUrl")
        .then((data) => {
          if (data?.error) {
            // form.reset();
            setError(data.error);
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
            <FormItem>
              <FormLabel>Access Code</FormLabel>
              <FormControl>
                <Input {...field} disabled={isPending} placeholder="4242424" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormError message={error} />
        <FormSuccess message={success} />
        <Button disabled={isPending} type="submit" className="w-full flex justify-center py-2">
          Go
        </Button>
      </form>
    </Form>
  );
};
