"use client";

import React, { useState, useTransition } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useIsLoading } from "@/hooks/use-is-loading";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GenericCombobox } from "@/components/generic-combobox";
import { toast } from "sonner";
import { calculateBMI, findChangesBetweenObjects } from "@/lib/utils";
import { cn } from "@/lib/utils";
import _ from "lodash";
import { logout } from "@/auth/actions/logout";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { CardHeaderComponent } from "./card-header";
import { ContactInformationSchema } from "../schemas/about";
import { Input } from "@/components/ui/input";
import { GenericCalendar } from "@/components/generic-calendar";
import { genders, heightsImperial, martialStatuses, races, states } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { editContactInformation, editPersonalInformation } from "../actions/about";
import { PhoneNumber } from "@/components/phone-number";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { GenericAddress } from "@/components/generic-address";
const inputClassName = "bg-secondary border-primary/10";

interface ContactInformationProps {
  contactInformation: z.infer<typeof ContactInformationSchema>;
}

export const ContactInformationForm = ({ contactInformation }: ContactInformationProps) => {
  if (!contactInformation) {
    return null;
  }
  const currentUser = useCurrentUser();
  // const [initialPhoneNumbers, setInitialContactInformation] = useState(contactInformation);

  const [initialContactInformation, setInitialContactInformation] = useState(contactInformation);
  const { isLoading, setIsLoading } = useIsLoading();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<z.infer<typeof ContactInformationSchema>>({
    resolver: zodResolver(ContactInformationSchema),
    defaultValues: {
      mobilePhone: contactInformation.mobilePhone,
      homePhone: contactInformation.homePhone,
      address: contactInformation.address,
    },
  });

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const onSubmit = (values: z.infer<typeof ContactInformationSchema>) => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    const changesOfPhoneNumbers = findChangesBetweenObjects(
      { mobilePhone: initialContactInformation.mobilePhone, homePhone: initialContactInformation.homePhone },
      { mobilePhone: values.mobilePhone, homePhone: values.homePhone },
    );

    let changesOfAddress: any = !contactInformation.address && !!values.address.address ? values.address : {};
    if (!!changesOfAddress && !!values.address.address && Object.keys(changesOfAddress).length === 0) {
      changesOfAddress = findChangesBetweenObjects(initialContactInformation.address, values.address);
    }

    const changesOfPhoneNumbersLength = Object.keys(changesOfPhoneNumbers).length;
    const changesOfAddressLength = Object.keys(changesOfAddress).length;

    if (changesOfPhoneNumbersLength === 0 && changesOfAddressLength === 0) {
      toast("No changes made");
      setIsEditing(false);
      return;
    }
    setIsLoading(true);
    startTransition(() => {
      editContactInformation(values)
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
            if (data.error === "Unauthorized") {
              logout();
            }
          }
          if (data.success) {
            setIsEditing(false);
            setInitialContactInformation(values);
            toast.success("Contact information successfully updated!");
          }
        })
        .catch(() => {
          toast.error("Something went wrong");
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  const { setValue, control, watch } = form;
  const handleEditToggle = () => setIsEditing(!isEditing);

  return (
    <Card className="min-h-full flex-grow transition border border-primary/10 rounded-xl">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-y-4">
            <CardHeaderComponent
              title="Contact Information"
              isEditing={isEditing}
              handleEditToggle={handleEditToggle}
              handleCancel={handleCancel}
            >
              <Button variant="outline" size="sm" className="h-8" disabled={isPending} type="submit">
                {isPending ? "Saving..." : "Save"}
              </Button>
            </CardHeaderComponent>
            <div className="grid grid-cols-1 md:grid-cols-3 w-full items-center gap-4 px-4">
              <FormField
                control={control}
                name="mobilePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="mobilePhone">Mobile Phone</FormLabel>
                    <PhoneNumber
                      fieldName="mobilePhone"
                      handleChange={(value) => setValue("mobilePhone", value)}
                      number={field.value}
                      disabled={!isEditing || isPending}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="homePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="homePhone">Home Phone</FormLabel>
                    <PhoneNumber
                      {...field}
                      fieldName="homePhone"
                      handleChange={(value) => setValue("homePhone", value)}
                      number={field.value}
                      disabled={!isEditing || isPending}
                    />
                  </FormItem>
                )}
              />
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  className="bg-secondary border-primary/10"
                  value={currentUser?.email || ""}
                  disabled={true}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-4 px-4">
              <FormField
                control={control}
                name="address.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="address">Address</FormLabel>
                    <Input
                      {...field}
                      value={field.value || ""}
                      className={inputClassName}
                      id="address"
                      name="address"
                      autoComplete="off"
                      placeholder="Address"
                      disabled={!isEditing || isPending}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="address.address2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="address2">Apt, suite, etc (optional)</FormLabel>
                    <Input
                      {...field}
                      value={field.value || ""}
                      className={inputClassName}
                      id="address2"
                      name="address2"
                      autoComplete="off"
                      placeholder="Address 2"
                      disabled={!isEditing || isPending}
                    />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 w-full items-center gap-4 px-4">
              <FormField
                control={control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="city">City</FormLabel>
                    <Input
                      {...field}
                      value={field.value || ""}
                      className={inputClassName}
                      id="city"
                      name="city"
                      autoComplete="off"
                      placeholder="City"
                      disabled={!isEditing || isPending}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="state">State</FormLabel>
                    <GenericCombobox
                      width={"w-full"}
                      handleChange={(value) => setValue("address.state", value)}
                      valueParam={field.value || ""}
                      disabled={!isEditing || isPending}
                      className={cn("font-normal w-full", inputClassName)}
                      placeholder="Select..."
                      searchPlaceholder="Search..."
                      noItemsMessage="No state found"
                      items={states}
                      //   items={user.unit === Unit.IMPERIAL ? heightsImperial : heightsMetric}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="address.zipcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="zipcode">ZIP / Postal code</FormLabel>
                    <Input
                      {...field}
                      value={field.value || ""}
                      className={inputClassName}
                      id="zipcode"
                      name="zipcode"
                      autoComplete="off"
                      placeholder="zipcode"
                      disabled={!isEditing || isPending}
                    />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
