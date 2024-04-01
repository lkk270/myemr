"use client";

import React, { useTransition } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenericCombobox } from "@/components/generic-combobox";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useMedicationStore } from "../_components/hooks/use-medications";
import { useNewMedicationModal } from "../_components/hooks/use-new-medication-modal";
import { cn } from "@/lib/utils";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { createMedication } from "@/lib/actions/medications";
import _ from "lodash";
import { medicationsList, medicationCategories, dosageFrequency, dosageUnits } from "@/lib/constants";
import { NewMedicationSchema } from "@/lib/schemas/medication";
import { logout } from "@/auth/actions/logout";
import { usePatientMemberStore } from "@/app/(platform)/(provider)/(organization)/(routes)/(patient)/hooks/use-patient-member-store";
const inputClassName = "bg-secondary border-primary/10";

export const NewMedicationForm = () => {
  const [isPending, startTransition] = useTransition();
  const { patientMember } = usePatientMemberStore();
  const currentUserPermissions = useCurrentUserPermissions();
  const medicationStore = useMedicationStore();
  const newMedicationModal = useNewMedicationModal();

  const form = useForm<z.infer<typeof NewMedicationSchema>>({
    resolver: zodResolver(NewMedicationSchema),
    defaultValues: {
      patientMemberId: currentUserPermissions.isProvider ? patientMember?.id : null,
      name: "",
      prescribedById: undefined,
      prescribedByName: "",
      category: "",
      dosage: "",
      dosageUnits: "",
      frequency: "",
      description: "",
      status: "active",
    },
  });

  const onSubmit = (values: z.infer<typeof NewMedicationSchema>) => {
    if (!currentUserPermissions.canAdd) return;

    startTransition(() => {
      createMedication(values)
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
            if (data.error === "Unauthorized" && !currentUserPermissions.hasAccount) {
              newMedicationModal.onClose();
              logout();
            }
          }
          if (data.success && !!data.medicationId) {
            const date = new Date();
            medicationStore.addMedication({
              ...values,
              dosageHistory: [],
              id: data.medicationId,
              createdAt: date,
              updatedAt: date,
            });
            newMedicationModal.onClose();
            toast.success("Medication successfully added!");
          }
        })
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const { setValue, control } = form;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex justify-center w-full max-w-[850px]">
        <div className="grid grid-cols-1 w-full">
          <div className="flex gap-x-4 justify-start">
            <Button variant="outline" size="sm" className="h-8" disabled={isPending} type="submit">
              Save
            </Button>
          </div>
          {/* Personal Information Card */}
          <Card className="w-full border-none">
            <CardContent className="pt-2">
              <div className="grid gap-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-4 px-4">
                  <FormField
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="medicationName">Name</FormLabel>
                        <GenericCombobox
                          valueParam={field.value}
                          handleChange={(value) => setValue("name", value)}
                          disabled={isPending}
                          className={cn("font-normal w-full", inputClassName)}
                          placeholder="Select..."
                          searchPlaceholder="Search..."
                          noItemsMessage="No medication found."
                          items={medicationsList}
                          allowOther={true}
                        />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="category">Category</FormLabel>
                        <GenericCombobox
                          handleChange={(value) => setValue("category", value)}
                          valueParam={field.value}
                          disabled={isPending}
                          className={cn("font-normal w-full", inputClassName)}
                          placeholder="Select..."
                          searchPlaceholder="Search..."
                          noItemsMessage="No category found."
                          items={medicationCategories}
                          // allowOther={true}
                        />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 w-full items-center gap-4 px-4">
                  <FormField
                    control={control}
                    name="dosage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="dosage">Dosage</FormLabel>
                        <Input
                          {...field}
                          className={inputClassName}
                          autoComplete="off"
                          type="number"
                          placeholder="Dosage"
                          disabled={isPending}
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="dosageUnits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="dosageUnits">Units</FormLabel>
                        <GenericCombobox
                          valueParam={field.value}
                          handleChange={(value) => setValue("dosageUnits", value)}
                          disabled={isPending}
                          className={cn("font-normal w-full", inputClassName)}
                          placeholder="Select..."
                          searchPlaceholder="Search..."
                          noItemsMessage="No units found."
                          items={dosageUnits}
                          allowOther={true}
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="frequency">Frequency</FormLabel>
                        <GenericCombobox
                          valueParam={field.value}
                          handleChange={(value) => setValue("frequency", value)}
                          disabled={isPending}
                          className={cn("font-normal w-full", inputClassName)}
                          placeholder="Select..."
                          searchPlaceholder="Search..."
                          noItemsMessage="No dosage frequency found."
                          items={dosageFrequency}
                        />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-4 px-4">
                  <FormField
                    control={control}
                    name="prescribedByName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="prescribedByName">Prescriber</FormLabel>
                        <Input
                          {...field}
                          className={inputClassName}
                          autoComplete="off"
                          placeholder="Prescriber"
                          disabled={isPending}
                        />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 w-full items-center gap-4 px-4">
                  <FormField
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="status">Status</FormLabel>
                        <div className="flex items-center">
                          <Switch
                            defaultChecked={true}
                            checked={field.value === "active"}
                            disabled={isPending}
                            name="status"
                            onCheckedChange={(value) => field.onChange(value ? "active" : "inactive")}
                          />
                          <span className="inline ml-2">{field.value.toUpperCase()}</span>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
};
