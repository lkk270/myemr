"use client";

import React, { useState } from "react";

import axios from "axios";

import { Medication } from "@prisma/client";
import { MedicationType, NewMedicationType } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenericCombobox } from "@/components/generic-combobox";
import { toast } from "sonner";
import { checkForInvalidNewMedication } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useMedicationStore } from "../_components/hooks/use-medications";
import { useNewMedicationModal } from "../_components/hooks/use-new-medication-modal";
import { cn } from "@/lib/utils";

import _ from "lodash";
import { medicationsList, medicationCategories, dosageFrequency, dosageUnits } from "@/lib/constants";
const inputClassName = "bg-secondary border-primary/10";

export const NewMedicationForm = () => {
  let error = "Something went wrong";
  const medicationStore = useMedicationStore();
  const newMedicationModal = useNewMedicationModal();
  const [medication, setMedication] = useState<NewMedicationType | null>({
    name: "",
    prescribedById: undefined,
    prescribedByName: "",
    category: "",
    dosage: "",
    dosageUnits: "",
    frequency: "",
    description: "",
    status: "active",
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateMedication = () => {
    if (!medication) {
      return "No medication";
    }

    const dataCheck = checkForInvalidNewMedication(medication);
    if (dataCheck !== "") {
      return dataCheck;
    }

    const doesMedicationExist = medicationStore.isMedicationNameExist(medication.name);
    if (doesMedicationExist) {
      return "This medication exists already, edit or delete it.";
    }

    return null; // All checks passed
  };
  const handleSave = () => {
    setIsLoading(true);
    const errorMessage = validateMedication();
    if (errorMessage) {
      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }
    const date = new Date();
    const promise = axios
      .post("/api/patient-update", { fieldsObj: medication, updateType: "newMedication" })
      .then(({ data }) => {
        const updatedMedication = {
          ...(medication as MedicationType),
          id: data.newMedicationId,
          createdAt: date,
          updatedAt: date,
        };
        medicationStore.addMedication(updatedMedication);
        newMedicationModal.onClose();
      })
      .catch((error) => {
        console.log(error?.response?.data);
        error = error?.response?.data || "Something went wrong";
        console.log(error);
        setIsLoading(false);

        throw error;
      })
      .finally(() => {
        //no need for set loading to false
        // Toggle edit mode off after operation
      });
    toast.promise(promise, {
      loading: "Saving changes",
      success: "Changes saved successfully",
      error: error,
      duration: 1250,
    });
  };

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
          <Button variant="outline" size="sm" className="h-8" disabled={isLoading} onClick={handleSave}>
            Save
          </Button>
        </div>
        {/* Personal Information Card */}
        <Card className="w-full ">
          <CardContent className="pt-2">
            <div className="grid gap-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-4 px-4">
                <div>
                  <Label htmlFor="medicationName">Name</Label>
                  <GenericCombobox
                    valueParam={medication?.name}
                    handleChange={(value) => handleChange("name", value)}
                    disabled={isLoading}
                    className={cn("font-normal w-full", inputClassName)}
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
                    disabled={isLoading}
                    className={cn("font-normal w-full", inputClassName)}
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
                    onChange={handleInputChange}
                    placeholder="Dosage"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="dosageUnits">Units</Label>
                  <GenericCombobox
                    valueParam={medication?.dosageUnits}
                    handleChange={(value) => handleChange("dosageUnits", value)}
                    disabled={isLoading}
                    className={cn("font-normal w-full", inputClassName)}
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
                    valueParam={medication?.frequency}
                    handleChange={(value) => handleChange("frequency", value)}
                    disabled={isLoading}
                    className={cn("font-normal w-full", inputClassName)}
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
                    onChange={handleInputChange}
                    placeholder="Prescriber"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 w-full items-center gap-4 px-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center">
                    <Switch
                      defaultChecked={true}
                      disabled={isLoading}
                      name="status"
                      onCheckedChange={(checked) => handleStatusChange(checked)}
                    />
                    <span className="inline ml-2">{medication?.status.toUpperCase() || "ACTIVE"}</span>
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
