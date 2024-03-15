"use client";

import * as z from "zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { states } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { GenericCombobox } from "@/components/generic-combobox";
import { PhoneNumber } from "@/components/phone-number";
import { AddressSchema } from "../../schema/organization";
// import MultipleSelector, { Option } from "@/components/ui/multiple-selector";

// const TAGS: Option[] = rootFolderCategories.concat([
//   { label: "Patient first", value: "patient first" },
// ]);

interface AddressFormProps {
  numOfCurrentAddresses: number;
  setOpen: (openValue: boolean) => void;
  addOrUpdateFunction: (newAddress: z.infer<typeof AddressSchema>) => void;
  initialData?: z.infer<typeof AddressSchema>;
}
export const AddressForm = ({ initialData, addOrUpdateFunction, setOpen, numOfCurrentAddresses }: AddressFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof AddressSchema>>({
    resolver: zodResolver(AddressSchema),
    defaultValues: initialData || {
      id: (numOfCurrentAddresses + 1).toString(),
      name: undefined,
      address: undefined,
      address2: undefined,
      city: undefined,
      state: undefined,
      zipcode: undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof AddressSchema>) => {
    addOrUpdateFunction(values);
    setOpen(false);
  };

  const { setValue, control, watch } = form;

  return (
    <div className="h-full p-4 max-w-3xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-10">
          <div className="space-y-2 w-full col-span-2">
            <div>
              <h3 className="text-lg font-medium">New Address</h3>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <Input
                    {...field}
                    value={field.value || ""}
                    id="name"
                    name="name"
                    autoComplete="off"
                    placeholder="Name"
                    disabled={isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="phone">Phone</FormLabel>
                  <PhoneNumber
                    {...field}
                    fieldName="phone"
                    className="border-primary/10"
                    handleChange={(value) => setValue("phone", value)}
                    number={field.value}
                    disabled={isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="address">Address</FormLabel>
                  <Input
                    {...field}
                    value={field.value || ""}
                    // className={inputClassName}
                    id="address"
                    name="address"
                    autoComplete="off"
                    placeholder="Address"
                    disabled={isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="address2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="address2">Apt, suite, etc (optional)</FormLabel>
                  <Input
                    {...field}
                    value={field.value || ""}
                    // className={inputClassName}
                    id="address2"
                    name="address2"
                    autoComplete="off"
                    placeholder="Address 2"
                    disabled={isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="city">City</FormLabel>
                  <Input
                    {...field}
                    value={field.value || ""}
                    // className={inputClassName}
                    id="city"
                    name="city"
                    autoComplete="off"
                    placeholder="City"
                    disabled={isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="state">State</FormLabel>
                  <GenericCombobox
                    width={"w-full"}
                    handleChange={(value) => setValue("state", value)}
                    valueParam={field.value || ""}
                    disabled={isPending}
                    className={cn(
                      "bg-black-300 font-normal min-w-[calc(100vw-90px)]  w-full sm:max-w-[843px] sm:min-w-[300px]",
                    )}
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No state found"
                    items={states}
                    transparentPopoverBg={true}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="zipcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="zipcode">ZIP / Postal code</FormLabel>
                  <Input
                    {...field}
                    value={field.value || ""}
                    id="zipcode"
                    name="zipcode"
                    autoComplete="off"
                    placeholder="Zipcode"
                    disabled={isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-full flex justify-center pt-12">
            <Button size="lg" disabled={isPending}>
              {initialData ? "Edit address" : "Add address"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
