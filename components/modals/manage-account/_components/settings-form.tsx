"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { Switch } from "@/components/ui/switch";
import { SettingsSchema } from "@/auth/schemas";
import { Button } from "@/components/ui/button";
import { settings } from "@/auth/actions/settings";
import { Form, FormField, FormControl, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { FormError } from "@/auth/components/form-error";
import { FormSuccess } from "@/auth/components/form-success";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const SettingsForm = () => {
  const user = useCurrentUser();
  const currentUserPermissions = extractCurrentUserPermissions(user);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      email: user?.email || undefined,
      name: user?.name || undefined,
      password: undefined,
      newPassword: undefined,
      role: user?.role || undefined,
      userType: user?.userType || undefined,
      isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined,
    },
  });

  // useEffect(() => {
  //   form.
  // }, [user]);
  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    setSuccess("");
    setError("");
    startTransition(() => {
      settings(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }
          if (data.success) {
            update();
            form.setValue("isTwoFactorEnabled", values.isTwoFactorEnabled);
            form.setValue("password", values.password);
            form.setValue("newPassword", values.newPassword);
            setSuccess(data.success);
          }
        })
        .catch((e) => {
          console.log(e);
          setError("Something went wrong!");
        });
    });
  };
  const watchedName = form.watch("name") || null;
  const watchedPassword = form.watch("password");
  const watchedNewPassword = form.watch("newPassword");
  const watchedIsTwoFactorEnabled = form.watch("isTwoFactorEnabled");
  console.log(user?.name);
  console.log(watchedName);
  console.log(watchedPassword);
  console.log(watchedNewPassword);
  console.log(watchedIsTwoFactorEnabled);
  return (
    <Form {...form}>
      <form className="space-y-6 w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {user?.isOAuth === false && (
            <>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" disabled={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {user.userType === "PROVIDER" && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          className="truncate"
                          {...field}
                          value={field.value || ""}
                          type="name"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        defaultValue={undefined}
                        // value={field.value || ""}
                        placeholder="******"
                        type="password"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="******"
                        type="password"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {/* <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select disabled={isPending} onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                    <SelectItem value={UserRole.USER}>User</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          {user?.isOAuth === false && (
            <FormField
              control={form.control}
              name="isTwoFactorEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Two Factor Authentication</FormLabel>
                    <FormDescription>Enable two factor authentication for your account</FormDescription>
                  </div>
                  <FormControl>
                    <Switch disabled={isPending} checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </div>
        <FormError message={error} />
        <FormSuccess message={success} />
        <Button
          disabled={
            isPending ||
            (currentUserPermissions.isProvider &&
              watchedName === user?.name &&
              !watchedPassword &&
              !watchedNewPassword &&
              !!watchedIsTwoFactorEnabled === !!user?.isTwoFactorEnabled) ||
            (currentUserPermissions.isPatient &&
              !watchedPassword &&
              !watchedNewPassword &&
              !!watchedIsTwoFactorEnabled === !!user?.isTwoFactorEnabled)
          }
          type="submit"
        >
          Save
        </Button>
      </form>
    </Form>
  );
};
