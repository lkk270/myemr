"use client";

import React, { useState } from "react";

import axios from "axios";

import { Medication, DosageHistory } from "@prisma/client";
import { MedicationType, PartialDosageHistoryType } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenericCombobox } from "@/components/generic-combobox";
import { toast } from "sonner";
import { checkForInvalidEditedMedication } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import _ from "lodash";
import { medicationsList, medicationCategories, dosageFrequency, dosageUnits } from "@/lib/constants";
import { DosageHistoryPopover } from "./dosage-history-popover";
import { useMedicationStore } from "../_components/hooks/use-medications";
import { useViewMedicationModal } from "../_components/hooks/use-view-medication-modal";
import { useIsLoading } from "@/hooks/use-is-loading";

const inputClassName = "bg-secondary border-primary/10";

interface MedicationProps {
  medicationParam: MedicationType | null;
}

export const MedicationForm = ({ medicationParam }: MedicationProps) => {
  const medicationStore = useMedicationStore();
  const viewMedicationModal = useViewMedicationModal();

  const [initialMedication, setInitialMedication] = useState<MedicationType | null>(medicationParam);
  const [medication, setMedication] = useState<MedicationType | null>(medicationParam);
  const [isEditing, setIsEditing] = useState(false);
  const { isLoading, setIsLoading } = useIsLoading();

  const getChangedFields = (newObj: any, originalObj: any): any => {
    // Directly compare non-object and non-array values
    return _.isEqual(newObj, originalObj) ? undefined : newObj;
  };

  const handleCancel = () => {
    setMedication(initialMedication);
    setIsEditing(false);
  };
  const handleSave = () => {
    setIsLoading(true);
    const changes: Partial<Medication> = {};
    if (medication !== null) {
      for (const key in initialMedication) {
        if (initialMedication.hasOwnProperty(key)) {
          const typedKey = key as keyof Medication;
          const changedField = getChangedFields(medication[typedKey], initialMedication[typedKey]);
          if ((changedField && Object.keys(changedField).length > 0) || changedField === "") {
            changes[typedKey] = changedField.trim();
          }
        }
      }
    }

    const dataCheck = checkForInvalidEditedMedication(changes);
    if (dataCheck !== "" || !medication || !initialMedication) {
      const toastMessage = dataCheck ? dataCheck : "Invalid medication";
      toast.error(toastMessage);
      setIsLoading(false);
      setMedication(initialMedication);
      return;
    }
    let dosageHistoryInitialFields: PartialDosageHistoryType | undefined = undefined;
    let updatedDosageHistoryEntry: DosageHistory | undefined = undefined;
    if (changes.dosage || changes.dosageUnits || changes.frequency) {
      // If so, set dosageHistoryInitialFields to the initial values
      dosageHistoryInitialFields = {
        dosage: initialMedication.dosage,
        dosageUnits: initialMedication.dosageUnits,
        frequency: initialMedication.frequency,
      };
    }
    if (Object.keys(changes).length > 0) {
      const promise = axios
        .post("/api/patient-update", {
          fieldsObj: changes,
          updateType: "editMedication",
          medicationId: medication.id,
          dosageHistoryInitialFields: dosageHistoryInitialFields,
        })
        .then((response) => {
          if (dosageHistoryInitialFields) {
            updatedDosageHistoryEntry = {
              id: "fake-id",
              medicationId: medication.id,
              dosage: dosageHistoryInitialFields.dosage,
              dosageUnits: dosageHistoryInitialFields.dosageUnits,
              frequency: dosageHistoryInitialFields.frequency,
              createdAt: new Date(),
            };
          }

          setInitialMedication(medication);
          medicationStore.updateMedication(medication, updatedDosageHistoryEntry);
          setIsEditing(false);
          viewMedicationModal.onClose();
        })

        .catch((error) => {
          // setMedication(initialMedication);

          throw error;
        })
        .finally(() => {
          setIsLoading(false);
          // Toggle edit mode off after operation
        });
      toast.promise(promise, {
        loading: "Saving changes",
        success: "Changes saved successfully",
        error: "Something went wrong",
        duration: 1250,
      });
    } else {
      toast("No changes were made");
      setIsLoading(false);
      setIsEditing(false); // Toggle edit mode off if no changes
    }
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMedication((prev) => (prev ? { ...prev, [name as keyof Medication]: value } : null));
  };

  const handleChange = (name: keyof Medication, value: string) => {
    setMedication((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleStatusChange = (checked: boolean) => {
    const newStatus = checked ? "active" : "inactive";
    setMedication((prev) => (prev ? { ...prev, status: newStatus } : null));
  };

  return (
    <div className="flex justify-center w-full max-w-[850px]">
      <div className="grid grid-cols-1 w-full">
        <div className="flex gap-x-4 justify-start pb-3">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={isLoading}
            onClick={isEditing ? handleSave : handleEditToggle}
          >
            {isEditing ? (isLoading ? "Saving..." : "Save") : "Edit"}
          </Button>
          {isEditing && !isLoading && (
            <Button variant="destructive" size="sm" className="h-8" disabled={isLoading} onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
        {/* Personal Information Card */}
        <Card className="w-full ">
          <CardContent className="pt-2">
            <div className="grid gap-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-4 px-4">
                <div>
                  <Label htmlFor="medicationName">Name</Label>
                  <GenericCombobox
                    handleChange={(value) => handleChange("name", value)}
                    valueParam={medication?.name}
                    disabled={true}
                    className="bg-secondary border-primary/10 font-normal w-full"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No medication found."
                    items={medicationsList}
                    allowOther={true}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <GenericCombobox
                    handleChange={(value) => handleChange("category", value)}
                    valueParam={medication?.category}
                    disabled={!isEditing || isLoading}
                    className={cn(inputClassName, "font-normal w-full")}
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No category found."
                    items={medicationCategories}
                    allowOther={true}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 w-full items-center gap-4 px-4">
                <div>
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    className={inputClassName}
                    id="dosage"
                    name="dosage"
                    autoComplete="off"
                    type="number"
                    value={medication?.dosage}
                    onChange={handleInputChange}
                    placeholder="Dosage"
                    disabled={!isEditing || isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="dosageUnits">Units</Label>
                  <GenericCombobox
                    handleChange={(value) => handleChange("dosageUnits", value)}
                    valueParam={medication?.dosageUnits}
                    disabled={!isEditing || isLoading}
                    className={cn(inputClassName, "font-normal w-full")}
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No units found."
                    items={dosageUnits}
                    allowOther={true}
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <GenericCombobox
                    handleChange={(value) => handleChange("frequency", value)}
                    valueParam={medication?.frequency}
                    disabled={!isEditing || isLoading}
                    className={cn(inputClassName, "font-normal w-full")}
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No dosage frequency found."
                    items={dosageFrequency}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-4 px-4">
                <div>
                  <Label htmlFor="prescribedByName">Prescriber</Label>
                  <Input
                    className={inputClassName}
                    id="prescribedByName"
                    name="prescribedByName"
                    autoComplete="off"
                    value={medication?.prescribedByName}
                    onChange={handleInputChange}
                    placeholder="Prescriber"
                    disabled={!isEditing || isLoading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 w-full items-center gap-4 px-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center">
                    <Switch
                      checked={medication?.status.toLowerCase() === "active"}
                      disabled={!isEditing || isLoading}
                      name="status"
                      onCheckedChange={(checked) => handleStatusChange(checked)}
                    />
                    <span className="inline ml-2">{medication?.status.toUpperCase()}</span>
                  </div>
                </div>
                <div>
                  <Label>Last updated</Label>
                  <div className="flex items-center">
                    <span className="inline text-sm">{medication?.updatedAt?.toISOString().split("T")[0] || "-"}</span>
                  </div>
                </div>
                <div>
                  <Label>Dosage History</Label>
                  <div className="flex items-center">
                    <DosageHistoryPopover dosageHistory={medication?.dosageHistory || []} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
