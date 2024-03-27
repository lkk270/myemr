"use client";

import React, { useState, useTransition } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useIsLoading } from "@/hooks/use-is-loading";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GenericCombobox } from "@/components/generic-combobox";
import { toast } from "sonner";
import { calculateBMI, findChangesBetweenObjects } from "@/lib/utils";
import { cn } from "@/lib/utils";
import _ from "lodash";
import { logout } from "@/auth/actions/logout";
import { CardHeaderComponent } from "./card-header";
import { PersonalInformationSchema } from "../schemas/about";
import { Input } from "@/components/ui/input";
import { GenericCalendar } from "@/components/generic-calendar";
import { genders, heightsImperial, martialStatuses, races } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { editPersonalInformation } from "../actions/about";

const inputClassName = "bg-secondary border-primary/10";

interface PersonalInformationProps {
  personalInformation: z.infer<typeof PersonalInformationSchema>;
}

export const PersonalInformationForm = ({ personalInformation }: PersonalInformationProps) => {
  if (!personalInformation) {
    return null;
  }
  const [initialPersonalInformation, setInitialPersonalInformation] = useState(personalInformation);
  const { setIsLoading } = useIsLoading();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<z.infer<typeof PersonalInformationSchema>>({
    resolver: zodResolver(PersonalInformationSchema),
    defaultValues: {
      firstName: personalInformation.firstName,
      lastName: personalInformation.lastName,
      dateOfBirth: personalInformation.dateOfBirth,
      gender: personalInformation.gender,
      race: personalInformation.race,
      maritalStatus: personalInformation.maritalStatus,
      height: personalInformation.height,
      weight: personalInformation.weight,
    },
  });

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const onSubmit = (values: z.infer<typeof PersonalInformationSchema>) => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    const changesObject = findChangesBetweenObjects(initialPersonalInformation, values);
    if (Object.keys(changesObject).length === 0) {
      toast("No changes made");
      setIsEditing(false);
      return;
    }
    setIsLoading(true);
    startTransition(() => {
      editPersonalInformation(values)
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
            if (data.error === "Unauthorized") {
              logout();
            }
          }
          if (data.success) {
            setIsEditing(false);
            setInitialPersonalInformation(values);
            toast.success("Personal information successfully updated!");
          }
        })
        .catch(() => toast.error("Something went wrong"))
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  const { setValue, control, watch } = form;

  const watchedHeight = watch("height");
  const watchedWeight = watch("weight");

  const handleEditToggle = () => setIsEditing(!isEditing);
  return (
    <Card className="min-h-full flex-grow transition border border-primary/10 rounded-xl">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-y-4">
            <CardHeaderComponent
              title="Personal Information"
              isEditing={isEditing}
              handleEditToggle={handleEditToggle}
              handleCancel={handleCancel}
            >
              <Button variant="outline" size="sm" className="h-8" disabled={isPending} type="submit">
                {isPending ? "Saving..." : "Save"}
              </Button>
            </CardHeaderComponent>
            <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-4 px-4">
              <FormField
                control={control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="firstName">First Name</FormLabel>
                    <Input
                      {...field}
                      className={cn(inputClassName, "truncate")}
                      id="firstName"
                      name="firstName"
                      autoComplete="off"
                      placeholder="First Name"
                      disabled={!isEditing || isPending}
                    />
                    {/* <FormMessage className="absolute bottom-10 left-25" /> */}
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="lastName">Last Name</FormLabel>
                    <Input
                      {...field}
                      className={cn(inputClassName, "truncate")}
                      id="lastName"
                      name="lastName"
                      autoComplete="off"
                      placeholder="Last Name"
                      disabled={!isEditing || isPending}
                    />
                    {/* <FormMessage className="absolute bottom-10 left-25" /> */}
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  xl:grid-cols-4 w-full items-center gap-4 px-4">
              <div className="w-full">
                <FormField
                  control={control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="dateOfBirth">Date of Birth</FormLabel>
                      <GenericCalendar
                        disabled={!isEditing || isPending}
                        handleChange={(value) => setValue("dateOfBirth", value)}
                        valueParam={field.value}
                      />
                    </FormItem>
                  )}
                />
                {/* dark:text-[#70606a] font-normal text-[#adafb4] */}
                {/*                       isEditing && "dark:text-[#d8dce1] text-[#0a101e]",
                 */}
              </div>

              <FormField
                control={control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="gender">Gender</FormLabel>
                    <GenericCombobox
                      width={"w-full"}
                      handleChange={(value) => setValue("gender", value)}
                      valueParam={field.value}
                      disabled={!isEditing || isPending}
                      className={inputClassName}
                      placeholder="Select..."
                      searchPlaceholder="Search..."
                      noItemsMessage="No gender found."
                      items={genders}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="race"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="race">Race</FormLabel>
                    <GenericCombobox
                      width={"w-full"}
                      handleChange={(value) => setValue("race", value)}
                      valueParam={field.value}
                      disabled={!isEditing || isPending}
                      className={inputClassName}
                      placeholder="Select..."
                      searchPlaceholder="Search..."
                      noItemsMessage="No race found."
                      items={races}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="maritalStatus">Marital Status</FormLabel>
                    <GenericCombobox
                      width={"w-full"}
                      handleChange={(value) => setValue("maritalStatus", value)}
                      valueParam={field.value}
                      disabled={!isEditing || isPending}
                      className={inputClassName}
                      placeholder="Select..."
                      searchPlaceholder="Search..."
                      items={martialStatuses}
                    />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 w-full lg:max-w-[60%] items-center gap-4 px-4">
              <FormField
                control={control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="maritalStatus">Height</FormLabel>
                    <GenericCombobox
                      width={"w-full"}
                      handleChange={(value) => setValue("height", value)}
                      valueParam={field.value}
                      disabled={!isEditing || isPending}
                      className={cn("sm:max-w-[120px]", inputClassName)}
                      placeholder="Select..."
                      searchPlaceholder="Search..."
                      noItemsMessage="No results"
                      items={heightsImperial}
                      //   items={user.unit === Unit.IMPERIAL ? heightsImperial : heightsMetric}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="weight">Weight</FormLabel>
                    <div className="relative flex items-center">
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        type="number"
                        id="weight"
                        name="weight"
                        min={2}
                        max={1500}
                        className={cn(inputClassName, "sm:max-w-[120px]")}
                        placeholder="Weight"
                        disabled={!isEditing || isPending}
                      />
                      <span className="pl-1">lbs</span>

                      {/* <span className="pl-1"> {user.unit === Unit.IMPERIAL ? "lbs" : "Kg"}</span> */}
                    </div>
                  </FormItem>
                )}
              />

              <div>
                <Label htmlFor="weight">BMI</Label>
                <Input
                  type="number"
                  id="bmi"
                  name="bmi"
                  placeholder="N/A"
                  className={cn(inputClassName, "sm:max-w-[120px]")}
                  value={
                    !!watchedHeight && !!watchedWeight ? calculateBMI("IMPERIAL", watchedHeight, watchedWeight) : ""
                  }
                  disabled={true}
                />
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
