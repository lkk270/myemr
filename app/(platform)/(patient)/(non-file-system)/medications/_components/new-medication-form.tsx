"use client";

import React, { useState } from "react";

import axios from "axios";

import { Medication } from "@prisma/client";
import { NewMedicationType } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenericCombobox } from "@/components/generic-combobox";
import { toast } from "sonner";
import { checkForInvalidMedication } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

import _ from "lodash";
import { medicationsList, medicationCategories, dosageFrequency, dosageUnits } from "@/lib/constants";

export const NewMedicationForm = () => {
  const [medication, setMedication] = useState<NewMedicationType | null>({
    name: "",
    prescribedById: "",
    prescribedByName: "",
    category: "",
    dosage: "",
    dosageUnits: "",
    frequency: "",
    description: "",
    status: "active",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);

    const dataCheck = checkForInvalidMedication(medication);
    if (dataCheck !== "") {
      toast.error(dataCheck);
      setIsLoading(false);
      return;
    }
    const promise = axios
      .post("/api/patient-update", { fieldsObj: medication, updateType: "newMedication" })
      .then((response) => {
        console.log("Update successful", response.data);
      })

      .catch((error) => {
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
                    className="dark:bg-slate-800 font-normal w-full"
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
                    className="dark:bg-slate-800 font-normal w-full"
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
                    className="bg-transparent border-secondary dark:bg-slate-800"
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
                    className="dark:bg-slate-800 font-normal w-full"
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
                    className="dark:bg-slate-800 font-normal w-full"
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
                    className="bg-transparent border-secondary dark:bg-slate-800"
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
