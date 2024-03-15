"use client";

import * as z from "zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { OrganizationSchema } from "../../schema/organization";
import { rootFolderCategories } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { GenericCombobox } from "@/components/generic-combobox";
import { PhoneNumber } from "@/components/phone-number";
import { NewAddressButton } from "../new-address-button";
// import MultipleSelector, { Option } from "@/components/ui/multiple-selector";

const organizationTypes = [
  { value: "CLINIC", label: "Clinic" },
  { value: "CLINICAL_TRIAL", label: "Clinical Trial" },
  { value: "PRIVATE_PRACTICE", label: "Private Practice" },
];

// const TAGS: Option[] = rootFolderCategories.concat([
//   { label: "Patient first", value: "patient first" },
// ]);

interface OrganizationFormProps {
  initialData?: z.infer<typeof OrganizationSchema>;
}
export const OrganizationForm = ({ initialData }: OrganizationFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof OrganizationSchema>>({
    resolver: zodResolver(OrganizationSchema),
    defaultValues: initialData || {
      title: "",
      category: "",
      subTitle: undefined,
      description: undefined,
      backgroundImageUrl: undefined,
      profileImageUrl: undefined,
      acceptMessages: undefined,
      tags: [],
      officeEmail: undefined,
      officePhone: undefined,
      address: [],
    },
  });

  const onSubmit = (values: z.infer<typeof OrganizationSchema>) => {};

  const { setValue, control, watch } = form;

  const watchedOfficeEmail = watch("officeEmail");

  useEffect(() => {
    if (watchedOfficeEmail === "") {
      setValue("officeEmail", undefined);
    }
  }, [watchedOfficeEmail]);

  return (
    <div className="h-full p-4 max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-10">
          <div className="space-y-2 w-full col-span-2">
            <div>
              <h3 className="text-lg font-medium">General Information</h3>
              <p className="text-sm text-muted-foreground">General information about your organization</p>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          {/* <FormField
            name="src"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center space-y-4 col-span-2">
                <FormControl>
                  <ImageUpload disabled={isPending} onChange={field.onChange} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  {/* <FormControl> */}
                  <Input disabled={isPending} placeholder="Hippocrates Associates" {...field} />
                  {/* </FormControl> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organizationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Type</FormLabel>
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
                      {organizationTypes.map((organizationType) => (
                        <SelectItem key={organizationType.value} value={organizationType.value}>
                          {organizationType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Cannot be changed later.</FormDescription>
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />
            <FormField
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="category">Category</FormLabel>
                  <GenericCombobox
                    valueParam={field.value}
                    handleChange={(value) => setValue("category", value)}
                    disabled={isPending}
                    className={cn(
                      "bg-black-300 font-normal min-w-[calc(100vw-90px)]  w-full sm:max-w-[843px] sm:min-w-[300px]",
                    )}
                    placeholder="Select a category..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No Category found."
                    items={rootFolderCategories}
                    transparentPopoverBg={true}
                  />
                  <FormDescription>Cannot be changed later.</FormDescription>
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem className="max-w-[300px]">
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      maxSelected={8}
                      creatable={true}
                      onMaxSelected={() => {
                        toast.error("Maximum of 8 tags allowed");
                      }}
                      value={field.value}
                      onChange={field.onChange}
                      defaultOptions={TAGS}
                      placeholder="Choose tags"
                      emptyIndicator={
                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                          no results found.
                        </p>
                      }
                    />
                    <FormMessage />
                  </FormControl>
                </FormItem>
              )}
            /> */}
          </div>
          <div className="flex flex-col gap-4">
            <FormField
              name="subTitle"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle...</FormLabel>
                  {/* <FormControl> */}
                  <Textarea
                    disabled={isPending}
                    rows={2}
                    className="bg-background resize-none"
                    placeholder={"Subtitle"}
                    {...field}
                  />
                  {/* </FormControl> */}
                  <FormDescription>One line about our organization.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  {/* <FormControl> */}
                  <Textarea
                    disabled={isPending}
                    rows={5}
                    className="bg-background resize-none"
                    placeholder={"Description..."}
                    {...field}
                  />
                  {/* </FormControl> */}
                  <FormDescription>
                    Describe your organization further and provide any relevant details.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2 w-full">
            <div>
              <h3 className="text-lg font-medium">Contact Information</h3>
              <p className="text-sm text-muted-foreground">
                Viewable to any patient connected to your organization (both are optional)
              </p>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              name="officeEmail"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office Email</FormLabel>
                  {/* <FormControl> */}
                  <Input disabled={isPending} placeholder="Hippocrates@earth.com" {...field} />
                  {/* </FormControl> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="officePhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="officePhone">Office Phone</FormLabel>
                  <PhoneNumber
                    {...field}
                    fieldName="officePhone"
                    className="border-primary/10"
                    handleChange={(value) => setValue("officePhone", value)}
                    number={field.value}
                    disabled={isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2 w-full">
            <div>
              <h3 className="text-lg font-medium">Addresses</h3>
              <p className="text-sm text-muted-foreground">Viewable to any patient connected to your organization</p>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          <div>
            <NewAddressButton asChild>
              <Button variant={"secondary"}>New address</Button>
            </NewAddressButton>
          </div>
          <div className="w-full flex justify-center">
            <Button size="lg" disabled={isPending}>
              {initialData ? "Edit your organization" : "Create a new organization"}
              <Wand2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
