"use client";

import * as z from "zod";
// import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { states } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { GenericCombobox } from "@/components/generic-combobox";
import { PhoneNumber } from "@/components/phone-number";
import { AddressSchema } from "@/lib/schemas/address";
import { findChangesBetweenObjects } from "@/lib/utils";

interface AddressFormProps {
  numOfCurrentAddresses: number;
  setOpen: (openValue: boolean) => void;
  addOrUpdateFunction: (newAddress: z.infer<typeof AddressSchema>) => void;
  initialData?: z.infer<typeof AddressSchema>;
}
export const AddressForm = ({ initialData, addOrUpdateFunction, setOpen, numOfCurrentAddresses }: AddressFormProps) => {
  const form = useForm<z.infer<typeof AddressSchema>>({
    resolver: zodResolver(AddressSchema),
    defaultValues: initialData || {
      address: undefined,
      address2: undefined,
      city: undefined,
      state: undefined,
      zipcode: undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof AddressSchema>) => {
    if (!!initialData) {
      let changesOfAddress: any = !initialData && !!values.address ? values.address : {};
      console.log(changesOfAddress);
      if (!!changesOfAddress && !!values.address && Object.keys(changesOfAddress).length === 0) {
        changesOfAddress = findChangesBetweenObjects(initialData, values);
      }
      const changesOfAddressLength = Object.keys(changesOfAddress).length;
      if (changesOfAddressLength === 0) {
        toast("No changes made");
      }
    }
    addOrUpdateFunction(values);
    setOpen(false);
  };

  const { setValue, control, watch } = form;

  return (
    <div className="h-full p-4 max-w-3xl">
      <Form {...form}>
        <form className="space-y-4 pb-10">
          <div className="space-y-2 w-full col-span-2">
            <div>
              <h3 className="text-lg font-medium">New Address</h3>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="address"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <div className="py-2">
                    <FormLabel htmlFor="address">Address</FormLabel>
                  </div>
                  <Input
                    {...field}
                    value={field.value || ""}
                    // className={inputClassName}
                    id="address"
                    name="address"
                    autoComplete="off"
                    placeholder="Address"
                    // disabled={isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="address2"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <div className="py-2">
                    <FormLabel htmlFor="address2">Apt, suite, etc (optional)</FormLabel>
                  </div>
                  <Input
                    {...field}
                    value={field.value || ""}
                    // className={inputClassName}
                    id="address2"
                    name="address2"
                    autoComplete="off"
                    placeholder="Address 2"
                    // disabled={isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="city"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <div className="py-2">
                    <FormLabel htmlFor="city">City</FormLabel>
                  </div>
                  <Input
                    {...field}
                    value={field.value || ""}
                    // className={inputClassName}
                    id="city"
                    name="city"
                    autoComplete="off"
                    placeholder="City"
                    // disabled={isPending}
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
                    // disabled={isPending}
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
                <FormItem className="space-y-0">
                  <div className="py-2">
                    <FormLabel htmlFor="zipcode">ZIP / Postal code</FormLabel>
                  </div>
                  <Input
                    {...field}
                    value={field.value || ""}
                    id="zipcode"
                    name="zipcode"
                    autoComplete="off"
                    placeholder="Zipcode"
                    // disabled={isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="w-full flex justify-center pt-12">
            <Button onClick={form.handleSubmit(onSubmit)} size="lg">
              {initialData ? "Edit address" : "Add address"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
