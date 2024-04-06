"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransition } from "react";
import { patientMemberPermissionTypes } from "@/lib/constants";
import { logout } from "@/auth/actions/logout";
import { useState } from "react";
import { useOrganizationsStore } from "../hooks/use-organizations";
import { addOrganizationForPatient } from "../actions/organizations";
import { ChooseAccessibleRootFoldersButton } from "../../patient-home/_components/chose-accessible-root-folders-button";
import { AboutAccessibleRootFoldersPopover } from "../../patient-home/_components/about-accessible-root-folders-popover";
import { AddOrganizationSchema } from "../schemas";

interface AddOrganizationFormProps {
  setOpen?: (value: boolean) => void;
}
export const AddOrganizationForm = ({ setOpen }: AddOrganizationFormProps) => {
  const { addOrganization } = useOrganizationsStore();
  const [accessibleRootFolderIds, setAccessibleRootFolderIds] = useState<string>("ALL_EXTERNAL");
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof AddOrganizationSchema>>({
    resolver: zodResolver(AddOrganizationSchema),
    defaultValues: {
      connectCode: "",
      role: "READ_ONLY",
      accessibleRootFolderIds: "ALL_EXTERNAL",
    },
  });

  const onSubmit = (values: z.infer<typeof AddOrganizationSchema>) => {
    startTransition(() => {
      addOrganizationForPatient(values)
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
            if (data.error === "Unauthorized") {
              logout();
            }
            if (data.error.includes("already")) {
              form.reset();
            }
          } else if (!data.member) {
            toast.error("Something went wrong");
          }
          if (!!data.success && !!data.member) {
            toast.success(data.success, { duration: 5000 });
            form.reset();
            addOrganization(data.member);
            if (setOpen) setOpen(false);
          }
        })
        .catch((e) => {
          console.log(e);
          toast.error("Something went wrong");
        });
    });
  };

  const { control, watch, setValue } = form;

  const handleAccessibleRootFoldersChange = (accessibleRootFolderIds: string) => {
    setAccessibleRootFolderIds(accessibleRootFolderIds);
    setValue("accessibleRootFolderIds", accessibleRootFolderIds);
  };

  const watchedAccessibleRootFolderIds = watch("accessibleRootFolderIds");
  const numOfRootFolders = watchedAccessibleRootFolderIds.split(",").length;
  const foldersText = numOfRootFolders === 1 ? "Folder" : "Folders";
  const crfButtonLabel =
    watchedAccessibleRootFolderIds === "ALL_EXTERNAL"
      ? "All Root Folders"
      : `${numOfRootFolders.toString()} Root ${foldersText}`;

  return (
    <div className="">
      <Form {...form}>
        <form className="space-y-4">
          <div className="space-y-2 w-full col-span-2">
            <div>
              <h3 className="text-lg font-medium">Add an Organization</h3>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={control}
              name="connectCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="inviteToken">Connect Code</FormLabel>
                  <div className="flex flex-row items-center justify-center">
                    <InputOTP
                      {...field}
                      pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                      disabled={isPending}
                      maxLength={8}
                      render={({ slots }) => (
                        <InputOTPGroup>
                          {slots.slice(0, 8).map((slot, index) => (
                            <InputOTPSlot key={index} {...slot} />
                          ))}
                        </InputOTPGroup>
                      )}
                    />
                  </div>
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
                      {patientMemberPermissionTypes.map((permissionType) => {
                        return (
                          <SelectItem key={permissionType.value} value={permissionType.value}>
                            {permissionType.label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-y-4">
              <FormLabel>Accessible Root Folders</FormLabel>
              <div className="flex flex-row gap-x-2">
                <ChooseAccessibleRootFoldersButton
                  initialDefaultRootFolders={watchedAccessibleRootFolderIds}
                  initialCsrfButtonLabel={crfButtonLabel}
                  asChild
                  handleAccessibleRootFoldersChange={handleAccessibleRootFoldersChange}
                >
                  <Button variant={"outline"} className="text-sm w-full">
                    {crfButtonLabel}
                  </Button>
                </ChooseAccessibleRootFoldersButton>
                <AboutAccessibleRootFoldersPopover />
              </div>
            </div>
          </div>
          <div className="w-full flex justify-center pt-8">
            <Button disabled={isPending} onClick={form.handleSubmit(onSubmit)} size="lg">
              Add Organization
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
