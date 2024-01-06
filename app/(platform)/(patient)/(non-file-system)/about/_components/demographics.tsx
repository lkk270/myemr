"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";

import axios from "axios";

import { PatientAddress, Unit } from "@prisma/client";
import { PatientDemographicsType } from "@/app/types";
import { PhoneNumber } from "@/components/phone-number";
import { GenericCombobox } from "@/components/generic-combobox";
import { GenericCalendar } from "@/components/generic-calendar";
import { GenericAddress } from "@/components/generic-address";
import { CardHeaderComponent } from "./card-header";
import { toast } from "sonner";
import { cn, checkForInvalidDemographicsData, calculateBMI } from "@/lib/utils";
import { genders, races, martialStatuses, heightsImperial, heightsMetric } from "@/lib/constants";

import _ from "lodash";
const inputClassName = "bg-secondary border-primary/10";

interface PatientDemographicsProps {
  patientDemographics: PatientDemographicsType;
}

type TrimmableObject = { [key: string]: Trimmable };
type TrimmableArray = Array<string | TrimmableObject>;
type Trimmable = string | TrimmableArray | TrimmableObject | null | undefined;
interface StringIndexedObject {
  [key: string]: any;
}

const tabsData = [
  { value: "demographics", label: "Demographics" },
  { value: "contact", label: "Contact" },
  { value: "insurance", label: "Insurance" },
];

export const Demographics = ({ patientDemographics }: PatientDemographicsProps) => {
  const [initialUser, setInitialUser] = useState<PatientDemographicsType>(patientDemographics);
  const [user, setUser] = useState<PatientDemographicsType>(patientDemographics);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    <Tabs orientation="vertical" defaultValue="demographics" className="w-full flex flex-col md:flex-row">
      {/* Sidebar with tabs */}
      <TabsList className="flex-row md:-mx-4 flex md:flex-col md:w-40 md:px-3 md:py-14 md:mt-2">
        {tabsData.map((tab) => (
          <TabsTrigger key={tab.value} className="w-full data-[state=active]:bg-primary/10" value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <Separator orientation="vertical" className="md:flex ml-6 hidden max-h-[200px] w-[2px]" />
      <Separator orientation="horizontal" className="flex mt-2 md:hidden w-full h-[2px]" />

      <div className="md:ml-6 flex justify-center w-full max-w-[1500px]">
        <TabsContent className="w-full" value="demographics">
          <Card className="min-h-full flex-grow shadow-lg shadow-zinc-700 transition border-1 rounded-xl">
            <CardHeaderComponent
              title="Personal Information"
              isEditing={isEditing}
              isLoading={isLoading}
              handleSave={handleSave}
              handleEditToggle={handleEditToggle}
              handleCancel={handleCancel}
            />

            <CardContent className="pt-4">
              {/* <CardTitle className="my-4 text-md sm:text-lg text-primary/50">Personal Information</CardTitle> */}
              <div className="grid gap-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-4 px-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      className={inputClassName}
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
                      className={inputClassName}
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

                    {/* dark:text-[#70606a] font-normal text-[#adafb4] */}
                    {/*                       isEditing && "dark:text-[#d8dce1] text-[#0a101e]",
                     */}
                    <GenericCalendar
                      disabled={!isEditing || isLoading}
                      handleChange={(value) => handleChange("dateOfBirth", value)}
                      valueParam={user.dateOfBirth}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <GenericCombobox
                      handleChange={(value) => handleChange("gender", value)}
                      valueParam={user.gender}
                      disabled={!isEditing || isLoading}
                      className={inputClassName}
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
                      className={inputClassName}
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
                      className={inputClassName}
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
                      className={cn("sm:max-w-[120px]", inputClassName)}
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
                        className={cn(inputClassName, " max-w-[240px] sm:max-w-[120px]")}
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
                      className={cn(inputClassName, " max-w-[240px] sm:max-w-[120px]")}
                      value={user.weight && user.height ? calculateBMI(user.unit, user.height, user.weight) : ""}
                      disabled={true}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent className="w-full" value="contact">
          <Card className="min-h-full shadow-lg shadow-zinc-700 transition border-1 rounded-xl">
            <CardHeaderComponent
              title="Contact Information"
              isEditing={isEditing}
              isLoading={isLoading}
              handleSave={handleSave}
              handleEditToggle={handleEditToggle}
              handleCancel={handleCancel}
            />
            <CardContent className="pt-4">
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
                    <Input
                      id="email"
                      name="email"
                      className="bg-secondary border-primary/10"
                      value={user.email}
                      disabled={true}
                    />
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
        </TabsContent>
      </div>
    </Tabs>
  );
};
