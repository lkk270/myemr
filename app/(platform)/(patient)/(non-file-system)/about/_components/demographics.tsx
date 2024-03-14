"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import React, { useState, useEffect } from "react";

import axios from "axios";

import { InsuranceSide, PatientAddress, Unit } from "@prisma/client";
import { PatientDemographicsType } from "@/app/types";
import { toast } from "sonner";
import { checkForInvalidDemographicsData, isLinkExpired } from "@/lib/utils";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useInsuranceImages } from "../hooks/use-insurance-images";
import _ from "lodash";
import { getPresignedInsuranceUrl } from "../../../(file-system)/actions/get-file-psu";
import { ImageViewer } from "../../../(file-system)/_components/file-viewers/image-viewer";
import { InsuranceSkeleton } from "./insurance-skeleton";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { PersonalInformationForm } from "./personal-information-form";
import { ContactInformationForm } from "./contact-information-form";

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
  const [isMounted, setIsMounted] = useState(false);
  const { imagesUrls, setInsuranceImageUrls } = useInsuranceImages();
  const currentUserPermissions = useCurrentUserPermissions();
  const [initialUser, setInitialUser] = useState<PatientDemographicsType>(patientDemographics);
  const [user, setUser] = useState<PatientDemographicsType>(patientDemographics);
  const [isEditing, setIsEditing] = useState(false);
  const { isLoading, setIsLoading } = useIsLoading();
  const [activeTab, setActiveTab] = useState("demographics");
  console.log(user);
  useEffect(() => {
    const fetchUrls = async () => {
      if (!isMounted) return;
      if (
        user.insuranceImagesSet &&
        activeTab === "insurance" &&
        (!imagesUrls["front"] ||
          !imagesUrls["back"] ||
          isLinkExpired(imagesUrls["front"]) ||
          isLinkExpired(imagesUrls["front"]))
      ) {
        try {
          setIsLoading(true);

          const frontUrlData = await getPresignedInsuranceUrl(InsuranceSide.FRONT);
          const backUrlData = await getPresignedInsuranceUrl(InsuranceSide.BACK);

          const frontUrl = frontUrlData.presignedUrl;
          const backUrl = backUrlData.presignedUrl;
          setInsuranceImageUrls({ front: frontUrl, back: backUrl });

          setIsMounted(true);
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
          setIsMounted(true);
          console.error("Failed to fetch presigned URLs", error);
        }
      }
    };

    // Only attempt to fetch URLs if the "insurance" tab is active
    setIsMounted(true);
    fetchUrls();
  }, [activeTab]);

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
    if (!currentUserPermissions.isPatient) return;
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

  const InsuranceContent = () => {
    // Decide the content based on the state
    let contentElements;

    if (imagesUrls.front && imagesUrls.back) {
      // Render ImageViewer components for front and back images
      contentElements = (
        <>
          <ImageViewer forInsurance fileId={InsuranceSide.FRONT} fileSrc={imagesUrls.front} />
          <ImageViewer forInsurance fileId={InsuranceSide.BACK} fileSrc={imagesUrls.back} />
        </>
      );
    } else {
      // Render InsuranceSkeleton components, with pulse only if isLoading is true
      const skeletonProps = isLoading ? { pulse: true } : {};
      contentElements = (
        <>
          <InsuranceSkeleton {...skeletonProps} />
          <InsuranceSkeleton {...skeletonProps} />
        </>
      );
    }

    return (
      <div
        className="items-center pt-2 grid grid-flow-row gap-2 auto-cols-max"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))" }}
      >
        {contentElements}
      </div>
    );
  };

  return (
    <Tabs orientation="vertical" defaultValue="demographics" className="w-full flex flex-col md:flex-row">
      {/* Sidebar with tabs */}
      <TabsList className="flex-row flex md:flex-col md:w-40 md:py-14 md:mt-2">
        {tabsData.map((tab) => (
          <TabsTrigger
            onClick={() => {
              setActiveTab(tab.value);
            }}
            key={tab.value}
            className="w-full data-[state=active]:bg-primary/10"
            value={tab.value}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <Separator orientation="vertical" className="md:flex ml-6 hidden max-h-[200px] w-[2px]" />
      <Separator orientation="horizontal" className="flex mt-2 md:hidden w-full h-[2px]" />

      <div className="md:ml-6 flex justify-center w-full max-w-[1500px] pb-28 xs:pb-0 ">
        <TabsContent className="w-full" value="demographics">
          <PersonalInformationForm
            personalInformation={{
              firstName: patientDemographics.firstName,
              lastName: patientDemographics.lastName,
              dateOfBirth: patientDemographics.dateOfBirth,
              gender: patientDemographics.gender,
              race: patientDemographics.race,
              maritalStatus: patientDemographics.maritalStatus,
              height: patientDemographics.height,
              weight: patientDemographics.weight,
            }}
          />
        </TabsContent>
        <TabsContent className="w-full" value="contact">
          <ContactInformationForm
            contactInformation={{
              mobilePhone: patientDemographics.mobilePhone,
              homePhone: patientDemographics.homePhone,
              address: patientDemographics.addresses.length > 0 ? patientDemographics.addresses[0] : null,
            }}
          />
        </TabsContent>
        <TabsContent className="w-full" value="insurance">
          <Card className="min-h-full flex-grow transition border border-primary/10 rounded-xl">
            <CardContent className="pt-4">
              <InsuranceContent />
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
};
