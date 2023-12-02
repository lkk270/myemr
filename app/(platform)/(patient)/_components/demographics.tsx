"use client";

import React, { useState } from "react";

import { PatientDemographicsType } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenericCombobox } from "@/components/generic-combobox";
import { GenericCalendar } from "@/components/generic-calendar";

interface PatientDemographicsProps {
  patientDemographics: PatientDemographicsType;
}

export const Demographics = ({ patientDemographics }: PatientDemographicsProps) => {
  const [user, setUser] = useState<PatientDemographicsType>(patientDemographics);

  const [isEditing, setIsEditing] = useState(false);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex justify-center w-full max-w-[1500px]">
      <div className="grid grid-cols-1 w-full">
        {/* Personal Information Card */}
        <Card className="w-full shadow-lg shadow-zinc-700 transition border-1 rounded-xl">
          <CardHeader className="flex flex-row justify-between items-center bg-secondary text-primary/70 rounded-t-xl">
            <CardTitle className="text-md sm:text-xl">Demographics</CardTitle>
            <Button onClick={handleEditToggle}>{isEditing ? "Save" : "Edit"}</Button>
          </CardHeader>

          <CardContent>
            <CardTitle className="my-4 text-md sm:text-lg text-primary/50">Personal Information</CardTitle>
            <div className="grid gap-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-4 px-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    className="bg-transparent border-secondary dark:bg-slate-800"
                    id="firstName"
                    name="firstName"
                    value={user.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    className="dark:bg-slate-800"
                    value={user.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  xl:grid-cols-4 w-full items-center gap-4 px-4">
                <div className="w-[240px]">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <GenericCalendar disabled={!isEditing} />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <GenericCombobox
                    disabled={!isEditing}
                    className="dark:bg-slate-800"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No gender found."
                    items={[
                      { value: "MALE", label: "Male" },
                      { value: "FEMALE", label: "Female" },
                    ]}
                  />
                </div>

                <div>
                  <Label htmlFor="race">Race</Label>
                  <GenericCombobox
                    disabled={!isEditing}
                    className="dark:bg-slate-800"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No race found."
                    items={[
                      { value: "ASIAN", label: "Asian" },
                      { value: "BLACK", label: "Black or African American" },
                      { value: "NATIVE", label: "Native American" },
                      { value: "ISLANDER", label: "Pacific Islander" },
                      { value: "WHITE", label: "White" },
                    ]}
                  />
                </div>

                <div>
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <GenericCombobox
                    disabled={!isEditing}
                    className="dark:bg-slate-800"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No race found."
                    items={[
                      { value: "SINGLE", label: "Single" },
                      { value: "MARRIED", label: "Married" },
                      { value: "DIVORCED", label: "Divorced" },
                      { value: "WIDOWED", label: "Widowed" },
                      { value: "SEPARATED", label: "Separated" },
                    ]}
                  />
                </div>
                {/* ... Include other fields like Middle Name, Gender, etc. ... */}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* ... Continue with other cards ... */}
    </div>
  );
};
