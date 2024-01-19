"use client";

import React, { useState } from "react";

import axios from "axios";

import { PatientAddress, Unit } from "@prisma/client";
import { PatientDemographicsContactType } from "@/app/types";
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

import _ from "lodash";

interface PatientDemographicsContactProps {
  patientDemographics: PatientDemographicsContactType;
}

type TrimmableObject = { [key: string]: Trimmable };
type TrimmableArray = Array<string | TrimmableObject>;
type Trimmable = string | TrimmableArray | TrimmableObject | null | undefined;
interface StringIndexedObject {
  [key: string]: any;
}
export const ContactForm = ({ patientDemographics }: PatientDemographicsContactProps) => {
  const [initialUser, setInitialUser] = useState<PatientDemographicsContactType>(patientDemographics);
  const [user, setUser] = useState<PatientDemographicsContactType>(patientDemographics);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // const [initialUser, setInitialUser] = useState<PatientDemographicsContactType>(patientDemographics);

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
    const changes: Partial<PatientDemographicsContactType> = {};

    for (const key in initialUser) {
      if (initialUser.hasOwnProperty(key)) {
        const typedKey = key as keyof PatientDemographicsContactType;
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
        <div className="flex gap-x-4 pb-6 pr-4 justify-end">
          <Button size="sm" disabled={isLoading} onClick={isEditing ? handleSave : handleEditToggle}>
            {isEditing ? (isLoading ? "Saving..." : "Save") : "Edit"}
          </Button>
          {isEditing && !isLoading && (
            <Button size="sm" variant={"destructive"} disabled={isLoading} onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
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
      </div>
    </div>
  );
};
