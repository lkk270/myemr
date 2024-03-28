"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { InviteMemberSchema } from "@/app/(platform)/(provider)/(organization)/schema/organization";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransition } from "react";
import { organizationMemberPermissionTypes } from "@/lib/constants";
import { inviteMember } from "@/app/(platform)/(provider)/(organization)/actions/organization";
import { logout } from "@/auth/actions/logout";
import { usePathname } from "next/navigation";

interface InviteMemberFormProps {}
export const InviteMemberForm = ({}: InviteMemberFormProps) => {
  const pathname = usePathname();
  const organizationId = pathname.split("/organization/")[1].split("/")[0];
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof InviteMemberSchema>>({
    resolver: zodResolver(InviteMemberSchema),
    defaultValues: {
      organizationId,
      email: "",
      role: "USER",
    },
  });

  const onSubmit = (values: z.infer<typeof InviteMemberSchema>) => {
    startTransition(() => {
      inviteMember(values)
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
            if (data.error === "Unauthorized") {
              logout();
            }
          }
          if (!!data.success) {
            toast.success(data.success, { duration: 5000 });
            form.reset();
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
              <h3 className="text-lg font-medium">Invite a member</h3>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    {...field}
                    value={field.value || ""}
                    id="email"
                    name="email"
                    autoComplete="off"
                    placeholder="Email"
                    disabled={isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isPending}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    {/* <FormControl> */}
                    <SelectTrigger className="bg-background hover:bg-[#f0f0f0] dark:hover:bg-[#2b2b2b]">
                      <SelectValue defaultValue={field.value} placeholder="Organization type" />
                    </SelectTrigger>
                    {/* </FormControl> */}
                    <SelectContent>
                      {organizationMemberPermissionTypes.map((permissionType) => {
                        if (permissionType.value !== "OWNER") {
                          return (
                            <SelectItem key={permissionType.value} value={permissionType.value}>
                              {permissionType.label}
                            </SelectItem>
                          );
                        }
                      })}
                    </SelectContent>
                  </Select>
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />
          </div>
          <div className="w-full flex justify-center pt-8">
            <Button disabled={isPending} onClick={form.handleSubmit(onSubmit)} size="lg">
              Invite Member
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
