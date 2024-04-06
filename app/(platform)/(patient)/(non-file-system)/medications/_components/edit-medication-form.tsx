"use client";

import React, { useState, useTransition } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";

import { editMedication } from "@/lib/actions/medications";
import { MedicationType } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenericCombobox } from "@/components/generic-combobox";
import { toast } from "sonner";
import { findChangesBetweenObjects } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import _ from "lodash";
import { logout } from "@/auth/actions/logout";
import { medicationsList, medicationCategories, dosageFrequency, dosageUnits } from "@/lib/constants";
import { DosageHistoryPopover } from "./dosage-history-popover";
import { useMedicationStore } from "../_components/hooks/use-medications";
import { useViewMedicationModal } from "../_components/hooks/use-view-medication-modal";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { EditMedicationSchema } from "@/lib/schemas/medication";
import { usePatientMemberStore } from "@/app/(platform)/(provider)/(organization)/(routes)/(patient)/hooks/use-patient-member-store";
const inputClassName = "bg-secondary border-primary/10";

interface MedicationProps {
  medicationParam: MedicationType | null;
}

export const MedicationForm = ({ medicationParam }: MedicationProps) => {
  if (!medicationParam) {
    return null;
  }
  const { patientMember } = usePatientMemberStore();
  const [isPending, startTransition] = useTransition();

  const currentUserPermissions = useCurrentUserPermissions();
  const medicationStore = useMedicationStore();
  const viewMedicationModal = useViewMedicationModal();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<z.infer<typeof EditMedicationSchema>>({
    resolver: zodResolver(EditMedicationSchema),
    defaultValues: {
      patientMemberId: currentUserPermissions.isProvider ? patientMember?.id : null,
      id: medicationParam.id,
      prescribedById: medicationParam.prescribedById,
      prescribedByName: medicationParam.prescribedByName,
      category: medicationParam.category,
      dosage: medicationParam.dosage,
      dosageUnits: medicationParam.dosageUnits,
      frequency: medicationParam.frequency,
      description: medicationParam.description,
      status: medicationParam.status!!,
    },
  });

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const onSubmit = (values: z.infer<typeof EditMedicationSchema>) => {
    if (!isEditing) {
      console.log("IN 80");
      setIsEditing(true);
      return;
    }
    const changesObject = findChangesBetweenObjects(medicationParam, values);
    if (Object.keys(changesObject).length === 0) {
      toast("No changes made");
      setIsEditing(false);
      return;
    }

    startTransition(() => {
      editMedication(values)
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
            if (data.error === "Unauthorized" && !currentUserPermissions.hasAccount) {
              viewMedicationModal.onClose();
              window.location.reload();
            }
          }
          if (data.success && !!data.medicationName && !!data.createdAt) {
            const date = new Date();

            medicationStore.updateMedication(
              {
                ...values,
                name: data.medicationName,
                createdAt: data.createdAt,
                updatedAt: date,
                dosageHistory: medicationParam.dosageHistory,
              },
              data.newDosageHistory,
            );

            setIsEditing(false);
            toast.success("Medication successfully updated!");
            viewMedicationModal.onClose();
          }
        })
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const { setValue, control } = form;

  const handleEditToggle = () => setIsEditing(!isEditing);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex justify-center w-full max-w-[850px]">
        <div className="grid grid-cols-1 w-full">
          <div className="flex gap-x-4 justify-start">
            {currentUserPermissions.canEdit && !isEditing && (
              <Button variant="outline" size="sm" className="h-8" disabled={isPending} onClick={handleEditToggle}>
                Edit
              </Button>
            )}
            {currentUserPermissions.canEdit && isEditing && (
              <>
                <Button variant="outline" size="sm" className="h-8" disabled={isPending} type="submit">
                  {isPending ? "Saving..." : "Save"}
                </Button>
                <Button variant="destructive" size="sm" className="h-8" disabled={isPending} onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            )}
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
                          valueParam={medicationParam.name}
                          disabled={true}
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
                          disabled={isPending || !isEditing}
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
                          disabled={isPending || !isEditing}
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
                          disabled={isPending || !isEditing}
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
                          disabled={isPending || !isEditing}
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
                          disabled={isPending || !isEditing}
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
                            disabled={isPending || !isEditing}
                            name="status"
                            onCheckedChange={(value) => field.onChange(value ? "active" : "inactive")}
                          />
                          <span className="inline ml-2">{field.value.toUpperCase()}</span>
                        </div>
                      </FormItem>
                    )}
                  />
                  <div>
                    <Label>Last updated</Label>
                    <div className="flex items-center">
                      <span className="inline text-sm">
                        {medicationStore
                          .getMedicationById(medicationParam.id)
                          ?.updatedAt?.toISOString()
                          .split("T")[0] || "-"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Dosage History</Label>
                    <div className="flex items-center">
                      <DosageHistoryPopover
                        dosageHistory={medicationStore.getMedicationById(medicationParam.id)?.dosageHistory || []}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
};
