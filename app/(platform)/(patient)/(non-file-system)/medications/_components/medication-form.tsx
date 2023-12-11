"use client";

import React, { useState } from "react";

import axios from "axios";

import { Medication } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenericCombobox } from "@/components/generic-combobox";
import { toast } from "sonner";
import { checkForInvalidData } from "@/lib/utils";

import _ from "lodash";
import { medicationsList, medicationCategories } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MedicationProps {
  medicationParam: Medication | null;
}

export const MedicationForm = ({ medicationParam }: MedicationProps) => {
  const [initialMedication, setInitialMedication] = useState<Medication | null>(medicationParam);
  const [medication, setMedication] = useState<Medication | null>(medicationParam);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    // const dataCheck = checkForInvalidData(changes, initialMedication);
    // if (dataCheck !== "") {
    //   toast.error(dataCheck);
    //   setIsLoading(false);
    //   setMedication(initialMedication);
    //   return;
    // }
    if (Object.keys(changes).length > 0) {
      const promise = axios
        .post("/api/patient-update", { fieldsObj: changes })
        .then((response) => {
          console.log("Update successful", response.data);

          // Update the medication state with the latest changes
          //   setInitialMedication((prevMedication) => ({ ...prevMedication, ...changes }));
          setInitialMedication(medication);
          setIsEditing(false);
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

  return (
    <div className="flex justify-center w-full max-w-[1500px]">
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
                    disabled={!isEditing || isLoading}
                    className="dark:bg-slate-800 font-normal w-full"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No medication found."
                    items={medicationsList}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <GenericCombobox
                    handleChange={(value) => handleChange("category", value)}
                    valueParam={medication?.category}
                    disabled={!isEditing || isLoading}
                    className="dark:bg-slate-800 font-normal w-full"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No category found."
                    items={medicationCategories}
                    allowOther={true}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-4 px-4">
                <div>
                  <Label htmlFor="medicationName">Name</Label>
                  <GenericCombobox
                    handleChange={(value) => handleChange("name", value)}
                    valueParam={medication?.name}
                    disabled={!isEditing || isLoading}
                    className="dark:bg-slate-800 font-normal w-full"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No medication found."
                    items={medicationsList}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <GenericCombobox
                    handleChange={(value) => handleChange("category", value)}
                    valueParam={medication?.category}
                    disabled={!isEditing || isLoading}
                    className="dark:bg-slate-800 font-normal w-full"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No category found."
                    items={medicationCategories}
                    allowOther={true}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-4 px-4">
                <div>
                  <Label htmlFor="medicationName">Name</Label>
                  <GenericCombobox
                    handleChange={(value) => handleChange("name", value)}
                    valueParam={medication?.name}
                    disabled={!isEditing || isLoading}
                    className="dark:bg-slate-800 font-normal w-full"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No medication found."
                    items={medicationsList}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <GenericCombobox
                    handleChange={(value) => handleChange("category", value)}
                    valueParam={medication?.category}
                    disabled={!isEditing || isLoading}
                    className="dark:bg-slate-800 font-normal w-full"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No category found."
                    items={medicationCategories}
                    allowOther={true}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-4 px-4">
                <div>
                  <Label htmlFor="medicationName">Name</Label>
                  <GenericCombobox
                    handleChange={(value) => handleChange("name", value)}
                    valueParam={medication?.name}
                    disabled={!isEditing || isLoading}
                    className="dark:bg-slate-800 font-normal w-full"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No medication found."
                    items={medicationsList}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <GenericCombobox
                    handleChange={(value) => handleChange("category", value)}
                    valueParam={medication?.category}
                    disabled={!isEditing || isLoading}
                    className="dark:bg-slate-800 font-normal w-full"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No category found."
                    items={medicationCategories}
                    allowOther={true}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-4 px-4">
                <div>
                  <Label htmlFor="medicationName">Name</Label>
                  <GenericCombobox
                    handleChange={(value) => handleChange("name", value)}
                    valueParam={medication?.name}
                    disabled={!isEditing || isLoading}
                    className="dark:bg-slate-800 font-normal w-full"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No medication found."
                    items={medicationsList}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <GenericCombobox
                    handleChange={(value) => handleChange("category", value)}
                    valueParam={medication?.category}
                    disabled={!isEditing || isLoading}
                    className="dark:bg-slate-800 font-normal w-full"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No category found."
                    items={medicationCategories}
                    allowOther={true}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-4 px-4">
                <div>
                  <Label htmlFor="medicationName">Name</Label>
                  <GenericCombobox
                    handleChange={(value) => handleChange("name", value)}
                    valueParam={medication?.name}
                    disabled={!isEditing || isLoading}
                    className="dark:bg-slate-800 font-normal w-full"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No medication found."
                    items={medicationsList}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* ... Continue with other cards ... */}
    </div>
  );
};
