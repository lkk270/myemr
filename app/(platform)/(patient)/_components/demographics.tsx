"use client";

import React, { useState } from "react";

import axios from "axios";

import { PatientAddress, Unit } from "@prisma/client";
import { PatientDemographicsType } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneNumber } from "@/components/phone-number";
import { GenericCombobox } from "@/components/generic-combobox";
import { GenericCalendar } from "@/components/generic-calendar";
import { GenericAddress } from "@/components/generic-address";
import { toast } from "sonner";
import { cn, checkForInvalidDemographicsData, calculateBMI } from "@/lib/utils";
import { genders, races, martialStatuses, heightsImperial, heightsMetric } from "@/lib/constants";
import { useIsLoading } from "@/hooks/use-is-loading";

import _ from "lodash";

interface PatientDemographicsProps {
  patientDemographics: PatientDemographicsType;
}

type TrimmableObject = { [key: string]: Trimmable };
type TrimmableArray = Array<string | TrimmableObject>;
type Trimmable = string | TrimmableArray | TrimmableObject | null | undefined;
interface StringIndexedObject {
  [key: string]: any;
}
export const Demographics = ({ patientDemographics }: PatientDemographicsProps) => {
  const [initialUser, setInitialUser] = useState<PatientDemographicsType>(patientDemographics);
  const [user, setUser] = useState<PatientDemographicsType>(patientDemographics);
  const [isEditing, setIsEditing] = useState(false);
  const { isLoading, setIsLoading } = useIsLoading();

  // const [initialUser, setInitialUser] = useState<PatientDemographicsType>(patientDemographics);

  const getChangedFields = (newObj: any, originalObj: any, typedKey?: string): any => {
    if (Array.isArray(newObj) && Array.isArray(originalObj)) {
      return newObj
        .map((item, index) => getChangedFields(item, originalObj[index] || {}))
        .filter((item) => item !== undefined && Object.keys(item).length > 0);
    } else if (
      typeof newObj === "object" &&
      newObj !== null &&
      typeof originalObj === "object" &&
      originalObj !== null
    ) {
      return Object.keys(newObj).reduce<StringIndexedObject>((acc, key) => {
        if (!_.isEqual(newObj[key], originalObj[key])) {
          acc[key] = newObj[key];
        }
        return acc;
      }, {});
    } else {
      // Directly compare non-object and non-array values
      return _.isEqual(newObj, originalObj) ? undefined : newObj;
    }
  };
  const trimStringsInObject = (obj: Trimmable): Trimmable => {
    if (typeof obj === "string") {
      return obj.trim();
    } else if (Array.isArray(obj)) {
      return obj.map((element) => {
        if (typeof element === "string") {
          return element.trim();
        } else if (typeof element === "object" && element !== null) {
          return trimStringsInObject(element) as TrimmableObject;
        } else {
          return element;
        }
      }) as TrimmableArray;
    } else if (obj && typeof obj === "object") {
      const reducedObject = Object.keys(obj).reduce<TrimmableObject>((acc, key) => {
        acc[key] = trimStringsInObject(obj[key]);
        return acc;
      }, {});
      return reducedObject as TrimmableObject;
    } else {
      return obj;
    }
  };

  const handleCancel = () => {
    setUser(initialUser);
    setIsEditing(false);
  };
  const handleSave = () => {
    setIsLoading(true);
    const changes: Partial<PatientDemographicsType> = {};

    for (const key in initialUser) {
      if (initialUser.hasOwnProperty(key)) {
        const typedKey = key as keyof PatientDemographicsType;
        const changedFields = getChangedFields(user[typedKey], initialUser[typedKey], typedKey);
        if ((changedFields && Object.keys(changedFields).length > 0) || changedFields === "") {
          changes[typedKey] = trimStringsInObject(changedFields);
        }
      }
    }

    const dataCheck = checkForInvalidDemographicsData(changes, initialUser);
    if (dataCheck !== "") {
      toast.error(dataCheck);
      setIsLoading(false);
      setUser(initialUser);
      return;
    }
    if (Object.keys(changes).length > 0) {
      const promise = axios
        .post("/api/patient-update", { fieldsObj: changes, updateType: "demographics" })
        .then((response) => {
          // Update the user state with the latest changes
          // setInitialUser((prevUser) => ({ ...prevUser, ...changes }));
          setInitialUser(user);
          setIsEditing(false);
        })

        .catch((error) => {
          // console.error(error);
          // console.log(user.race);
          // console.log(initialUser.firstName);
          // console.log(initialUser.race);
          // setUser((prevUser) => ({ ...prevUser, ...initialUser }));
          // console.log(user.race);
          // console.log(user.firstName);
          // setUser(initialUser);
          // Toggle edit mode off after operation

          throw error;
        })
        .finally(() => {
          setIsLoading(false);
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
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (newAddress: PatientAddress) => {
    setUser((prev) => ({
      ...prev,
      addresses: [newAddress], // Update the first address or add new
    }));
  };

  const handleChange = (name: string, value: string) => {
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex justify-center w-full max-w-[1500px]">
      <div className="grid grid-cols-1 w-full">
        {/* Personal Information Card */}
        <Card className="w-full shadow-lg shadow-zinc-700 transition border-1 rounded-xl">
          <CardHeader className="flex flex-row justify-between items-center bg-secondary text-primary/70 rounded-t-xl">
            <CardTitle className="text-md sm:text-xl">Demographics</CardTitle>
            <div className="flex gap-x-4">
              <Button disabled={isLoading} onClick={isEditing ? handleSave : handleEditToggle}>
                {isEditing ? (isLoading ? "Saving..." : "Save") : "Edit"}
              </Button>
              {isEditing && !isLoading && (
                <Button variant={"destructive"} disabled={isLoading} onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
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
                    autoComplete="off"
                    value={user.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    disabled={!isEditing || isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    className="my-class"
                    value={user.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    disabled={!isEditing || isLoading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  xl:grid-cols-4 w-full items-center gap-4 px-4">
                <div className="w-[240px] ">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>

                  <div
                    className={cn(
                      "border-[1px] font-bold dark:border-none border-[#f0f4f7] rounded-md",
                      isEditing && "",
                    )}
                  >
                    {/* dark:text-[#70606a] font-normal text-[#adafb4] */}
                    {/*                       isEditing && "dark:text-[#d8dce1] text-[#0a101e]",
                     */}
                    <GenericCalendar
                      disabled={!isEditing || isLoading}
                      handleChange={(value) => handleChange("dateOfBirth", value)}
                      valueParam={user.dateOfBirth}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <GenericCombobox
                    handleChange={(value) => handleChange("gender", value)}
                    valueParam={user.gender}
                    disabled={!isEditing || isLoading}
                    className="dark:bg-slate-800 font-normal"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No gender found."
                    items={genders}
                  />
                </div>

                <div>
                  <Label htmlFor="race">Race</Label>
                  <GenericCombobox
                    handleChange={(value) => handleChange("race", value)}
                    valueParam={user.race}
                    disabled={!isEditing || isLoading}
                    className="dark:bg-slate-800 font-normal"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No race found."
                    items={races}
                  />
                </div>

                <div>
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <GenericCombobox
                    valueParam={user.maritalStatus}
                    handleChange={(value) => handleChange("maritalStatus", value)}
                    disabled={!isEditing || isLoading}
                    className="dark:bg-slate-800 font-normal"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No race found."
                    items={martialStatuses}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 w-full lg:max-w-[50%] items-center gap-4 px-4">
                <div>
                  <Label htmlFor="height">Height</Label>
                  <GenericCombobox
                    valueParam={user.height}
                    handleChange={(value) => handleChange("height", value)}
                    disabled={!isEditing || isLoading}
                    className="dark:bg-slate-800 font-normal sm:max-w-[120px]"
                    placeholder="Select..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No results"
                    items={user.unit === Unit.IMPERIAL ? heightsImperial : heightsMetric}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <div className="relative flex items-center">
                    <Input
                      type="number"
                      id="weight"
                      name="weight"
                      min={2}
                      max={1500}
                      className="dark:bg-slate-800 max-w-[240px] sm:max-w-[120px]"
                      value={user.weight || ""}
                      onChange={handleInputChange}
                      placeholder="Weight"
                      disabled={!isEditing || isLoading}
                    />
                    <span className="pl-1"> {user.unit === Unit.IMPERIAL ? "lbs" : "Kg"}</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="weight">BMI</Label>
                  <Input
                    type="number"
                    id="bmi"
                    name="bmi"
                    placeholder="N/A"
                    className="dark:bg-slate-800 max-w-[240px] sm:max-w-[120px]"
                    value={user.weight && user.height ? calculateBMI(user.unit, user.height, user.weight) : ""}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
            <CardTitle className="my-4 text-md sm:text-lg text-primary/50">Contact</CardTitle>
            <div className="grid gap-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 w-full items-center gap-4 px-4">
                <div>
                  <Label htmlFor="mobilePhone">Mobile phone</Label>
                  <PhoneNumber
                    fieldName="mobilePhone"
                    handleChange={handleChange}
                    disabled={!isEditing || isLoading}
                    number={user.mobilePhone}
                  />
                </div>
                <div>
                  <Label htmlFor="homePhone">Home phone</Label>
                  <PhoneNumber
                    fieldName="homePhone"
                    handleChange={handleChange}
                    disabled={!isEditing || isLoading}
                    number={user.homePhone}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" className="my-class" value={user.email} disabled={true} />
                </div>
              </div>
              <GenericAddress
                handleChange={handleAddressChange}
                address={user.addresses.length > 0 ? user.addresses[0] : null}
                disabled={!isEditing || isLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* ... Continue with other cards ... */}
    </div>
  );
};
