"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { JoinOrganizationSchema } from "@/app/(platform)/(provider)/(organization)/schema/organization";
import { useState, useTransition } from "react";
import { logout } from "@/auth/actions/logout";
import { Spinner } from "@/components/loading/spinner";
import { FormError } from "@/auth/components/form-error";
import { joinOrganization } from "../../actions/organization";
import { useRouter } from "next/navigation";
interface JoinOrganizationForm {
  setOpen: (value: boolean) => void;
}
export const JoinOrganizationForm = ({ setOpen }: JoinOrganizationForm) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof JoinOrganizationSchema>>({
    resolver: zodResolver(JoinOrganizationSchema),
    defaultValues: {
      inviteToken: "",
    },
  });

  const onSubmit = (values: z.infer<typeof JoinOrganizationSchema>) => {
    startTransition(() => {
      joinOrganization(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
            if (data.error === "Unauthorized") {
              logout();
            }
          }
          if (!!data.success && !!data.organizationId) {
            setOpen(false);
            toast.success(data.success);
            router.refresh();
            // router.push(`/organization/${data.organizationId}/settings`);
          }
        })
        .catch((e) => {
          console.log(e);
          toast.error("Something went wrong");
        });
    });
  };
  const { control } = form;

  return (
    <div className="h-full max-w-3xl">
      <Form {...form}>
        <form className="space-y-4">
          <div className="space-y-2 w-full col-span-2">
            <div>
              <h3 className="text-lg font-medium">Join an Organization</h3>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          <div className="grid grid-cols-1">
            <FormField
              control={control}
              name="inviteToken"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-y-4 items-center">
                  <FormLabel htmlFor="inviteToken">Enter invite Code</FormLabel>
                  <div className="relative flex flex-row items-center justify-center w-full">
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
          </div>
          <FormError message={error} />

          {/* <div className="w-full flex justify-center pt-8">
            <Button disabled={isPending} onClick={form.handleSubmit(onSubmit)} size="lg">
              Join Organization
            </Button>
          </div> */}
        </form>
      </Form>
    </div>
  );
};
