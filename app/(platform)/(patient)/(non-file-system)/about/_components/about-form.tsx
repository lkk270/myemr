"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import React, { useTransition, useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { InsuranceSide } from "@prisma/client";
import { PatientDemographicsType } from "@/app/types";
import { toast } from "sonner";
import { isLinkExpired } from "@/lib/utils";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useInsuranceImages } from "../hooks/use-insurance-images";
import { getPresignedInsuranceUrl } from "../../../(file-system)/actions/get-file-psu";
import { ImageViewer } from "../../../(file-system)/_components/file-viewers/image-viewer";
import { InsuranceSkeleton } from "./insurance-skeleton";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { AboutSchema } from "../schemas/about";
import { useUploadInsuranceModal } from "../hooks/use-upload-insurance-modal";
import { Label } from "@/components/ui/label";
import { GenericCombobox } from "@/components/generic-combobox";
import { calculateBMI, findChangesBetweenObjects } from "@/lib/utils";
import { cn } from "@/lib/utils";
import _ from "lodash";
import { logout } from "@/auth/actions/logout";
import { Input } from "@/components/ui/input";
import { GenericCalendar } from "@/components/generic-calendar";
import { genders, heightsImperial, martialStatuses, races } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { editAbout } from "../actions/about";
import { Ban, PencilLine, Trash, Save } from "lucide-react";
import { OpenAddressButton } from "./open-address-button";
import { AddressSchema } from "@/lib/schemas/address";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { PhoneNumber } from "@/components/phone-number";
import { ViewAbout } from "./view-about";
import { usePatientMemberStore } from "@/app/(platform)/(provider)/(organization)/(routes)/(patient)/hooks/use-patient-member-store";
const inputClassName = "bg-secondary border-primary/10";

interface AboutProps {
  initialData: PatientDemographicsType;
}

type TrimmableObject = { [key: string]: Trimmable };
type TrimmableArray = Array<string | TrimmableObject>;
type Trimmable = string | TrimmableArray | TrimmableObject | null | undefined;
interface StringIndexedObject {
  [key: string]: any;
}

const tabsData = [
  { value: "about", label: "About" },
  { value: "insurance", label: "Insurance" },
];

export const About = ({ initialData }: AboutProps) => {
  const { patientMember } = usePatientMemberStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isFetchingInsuranceImages, setIsFetchingInsuranceImages] = useState(false);
  const { imagesUrls, setInsuranceImageUrls } = useInsuranceImages();
  const { onOpen } = useUploadInsuranceModal();
  const currentUser = useCurrentUser();
  const currentUserPermissions = extractCurrentUserPermissions(currentUser);
  const [initialDataDynamic, setInitialDataDynamic] = useState<PatientDemographicsType>(initialData);
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const { isLoading, setIsLoading } = useIsLoading();
  const [activeTab, setActiveTab] = useState("about");

  if (!currentUser) {
    return <div>null</div>;
  }
  const form = useForm<z.infer<typeof AboutSchema>>({
    resolver: zodResolver(AboutSchema),
    defaultValues: {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      dateOfBirth: initialData.dateOfBirth,
      gender: initialData.gender,
      race: initialData.race,
      maritalStatus: initialData.maritalStatus,
      height: initialData.height,
      weight: initialData.weight,
      mobilePhone: initialData.mobilePhone,
      homePhone: initialData.homePhone,
      address: initialData.addresses.length > 0 ? initialData.addresses[0] : undefined,
    },
  });

  useEffect(() => {
    const fetchUrls = async () => {
      if (!isMounted) return;
      if (
        initialData.insuranceImagesSet &&
        activeTab === "insurance" &&
        (!imagesUrls["front"] ||
          !imagesUrls["back"] ||
          isLinkExpired(imagesUrls["front"]) ||
          isLinkExpired(imagesUrls["front"]))
      ) {
        try {
          console.log("108");
          setIsFetchingInsuranceImages(true);
          setIsLoading(true);
          let patientProfileId = null;
          if (!!patientMember) patientProfileId = patientMember.patientProfileId;

          const frontUrlData = await getPresignedInsuranceUrl(InsuranceSide.FRONT, false, patientProfileId);
          const backUrlData = await getPresignedInsuranceUrl(InsuranceSide.BACK, false, patientProfileId);

          const frontUrl = frontUrlData.presignedUrl;
          const backUrl = backUrlData.presignedUrl;
          setInsuranceImageUrls({ front: frontUrl, back: backUrl });

          setIsMounted(true);
          setIsLoading(false);
          setIsFetchingInsuranceImages(false);
        } catch (error) {
          setIsLoading(false);
          setIsMounted(true);
          setIsFetchingInsuranceImages(false);
          console.error("Failed to fetch presigned URLs", error);
        }
      }
    };

    // Only attempt to fetch URLs if the "insurance" tab is active
    setIsMounted(true);
    fetchUrls();
  }, [activeTab]);

  const onSubmit = (values: z.infer<typeof AboutSchema>) => {
    let nonAddressChanges: any = {};

    const { addresses: initialDataAddresses, ...initialDataNonAddressesObj } = initialDataDynamic;
    const { address, ...nonAddressesObj } = values;

    nonAddressChanges = findChangesBetweenObjects(initialDataNonAddressesObj, nonAddressesObj);
    const nonAddressChangesLength = Object.keys(nonAddressChanges).length;

    const addressChanges =
      !!address && initialDataAddresses.length > 0 ? findChangesBetweenObjects(initialDataAddresses[0], address) : {};
    const addressChangesLength = Object.keys(addressChanges).length;
    const addressChanged =
      (!address && initialDataAddresses.length > 0) ||
      (!!address && initialDataAddresses.length === 0) ||
      addressChangesLength > 0
        ? true
        : false;
    if (nonAddressChangesLength === 0 && !addressChanged) {
      toast("No changes made");
      setIsEditing(false);
      return;
    }
    setIsLoading(true);
    startTransition(() => {
      editAbout(values)
        .then((data) => {
          if (data.error) {
            console.log(data.error);
            toast.error(data.error);
            if (data.error === "Unauthorized") {
              logout();
            }
          }
          if (data.success) {
            setIsEditing(false);
            setInitialDataDynamic({
              ...values,
              email: initialData.email,
              unit: initialData.unit,
              addresses: initialData.addresses,
              insuranceImagesSet: initialData.insuranceImagesSet,
            });
            toast.success("Personal information successfully updated!");
          }
        })
        .catch((error) => {
          console.log(error);
          toast.error("Something went wrong");
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  const handleEditToggle = (e: any) => {
    e.preventDefault();
    if (isEditing) {
      form.reset();
      toast("No changes made");
    }
    setIsEditing(!isEditing);
  };

  const addOrUpdateAddress = (newAddress: z.infer<typeof AddressSchema>) => {
    setValue("address", newAddress);
  };

  const removeAddress = () => {
    setValue("address", undefined);
  };

  const InsuranceContent = () => {
    // Decide the content based on the state
    let contentElements;
    if (!isFetchingInsuranceImages && imagesUrls.front && imagesUrls.back) {
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
      <Card className="min-h-full flex-grow transition border border-primary/10 rounded-xl">
        <CardContent className="pt-4">
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-col">
                <h3 className="text-lg font-medium">Insurance</h3>
              </div>
              <div className="flex flex-row gap-x-2">
                {currentUserPermissions.isPatient && (
                  <Button disabled={isLoading} size="sm" onClick={onOpen}>
                    Upload
                  </Button>
                )}
              </div>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          <div
            className="items-center pt-2 grid grid-flow-row gap-2 auto-cols-max"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))" }}
          >
            {contentElements}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isEditing && !!initialData && !!initialDataDynamic) {
    return (
      <Tabs orientation="vertical" defaultValue="about" className="w-full flex flex-col md:flex-row">
        <TabsList className="flex-row flex md:flex-col md:w-40 md:py-10 md:px-2 md:mt-2">
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
        <Separator orientation="vertical" className="md:flex mx-6 hidden max-h-[200px] w-[2px]" />
        <Separator orientation="horizontal" className="flex mt-2 md:hidden w-full h-[2px]" />
        <TabsContent className="w-full" value="about">
          <Card className="min-h-full flex-grow transition border border-primary/10 rounded-xl">
            <CardContent>
              <ViewAbout
                handleEditToggle={handleEditToggle}
                initialData={{ ...initialDataDynamic, email: currentUser.email!!, imageUrl: currentUser.image }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent className="w-full" value="insurance">
          <InsuranceContent />
        </TabsContent>
      </Tabs>
    );
  }

  const { setValue, control, watch } = form;

  const watchedHeight = watch("height");
  const watchedWeight = watch("weight");
  const watchedAddress = watch("address");

  return (
    <Tabs orientation="vertical" defaultValue="about" className="w-full flex flex-col md:flex-row">
      {/* Sidebar with tabs */}
      <TabsList className="flex-row flex md:flex-col md:w-40 md:py-10 md:px-2 md:mt-2">
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
        <TabsContent className="w-full" value="about">
          <Card className="min-h-full flex-grow transition border border-primary/10 rounded-xl">
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-y-4">
                  <div className="flex flex-col pt-4 gap-y-4">
                    <div className="flex flex-row justify-between items-center">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-medium">About</h3>
                      </div>
                      {currentUserPermissions.isPatient && (
                        <div className="flex flex-row gap-x-2">
                          {!isPending && (
                            <Button
                              className="w-10 xs:w-24 h-9 items-center"
                              variant={"outline"}
                              onClick={(e) => {
                                handleEditToggle(e);
                              }}
                            >
                              {isEditing ? (
                                <Ban className="shrink-0 w-4 h-4 xs:mr-2" />
                              ) : (
                                <PencilLine className="shrink-0 w-4 h-4 xs:mr-2" />
                              )}
                              <span className="hidden xs:flex">{isEditing ? "Cancel" : "Edit"}</span>
                            </Button>
                          )}
                          {isEditing && (
                            <Button
                              type="submit"
                              disabled={isPending}
                              className="w-10 xs:w-24 h-9 items-center bg-[#12623b] hover:bg-[#176d44]"
                              variant={"outline"}
                            >
                              <Save className="shrink-0 w-4 h-4 xs:mr-2" />
                              <span className="hidden xs:flex">{isPending ? "Saving..." : "Save"}</span>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    <Separator className="bg-primary/10" />
                  </div>

                  <div className="flex flex-col gap-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-4 px-4">
                      <FormField
                        control={control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <div className="pb-2">
                              <FormLabel htmlFor="firstName">First Name</FormLabel>
                            </div>
                            <Input
                              {...field}
                              className={cn(inputClassName, "truncate")}
                              id="firstName"
                              name="firstName"
                              autoComplete="off"
                              placeholder="First Name"
                              disabled={!isEditing || isPending}
                            />
                            <FormMessage className="absolute" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <div className="pb-2">
                              <FormLabel htmlFor="lastName">Last Name</FormLabel>
                            </div>
                            <Input
                              {...field}
                              className={cn(inputClassName, "truncate")}
                              id="lastName"
                              name="lastName"
                              autoComplete="off"
                              placeholder="Last Name"
                              disabled={!isEditing || isPending}
                            />
                            <FormMessage className="absolute" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  xl:grid-cols-4 w-full items-center gap-4 px-4">
                      <div className="w-full">
                        <FormField
                          control={control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="dateOfBirth">Date of Birth</FormLabel>
                              <GenericCalendar
                                disabled={!isEditing || isPending}
                                handleChange={(value) => setValue("dateOfBirth", value)}
                                valueParam={field.value}
                              />
                            </FormItem>
                          )}
                        />
                        {/* dark:text-[#70606a] font-normal text-[#adafb4] */}
                        {/*                       isEditing && "dark:text-[#d8dce1] text-[#0a101e]",
                         */}
                      </div>

                      <FormField
                        control={control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="gender">Gender</FormLabel>
                            <GenericCombobox
                              width={"w-full"}
                              handleChange={(value) => setValue("gender", value)}
                              valueParam={field.value}
                              disabled={!isEditing || isPending}
                              className={inputClassName}
                              placeholder="Select..."
                              searchPlaceholder="Search..."
                              noItemsMessage="No gender found."
                              items={genders}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="race"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="race">Race</FormLabel>
                            <GenericCombobox
                              width={"w-full"}
                              handleChange={(value) => setValue("race", value)}
                              valueParam={field.value}
                              disabled={!isEditing || isPending}
                              className={inputClassName}
                              placeholder="Select..."
                              searchPlaceholder="Search..."
                              noItemsMessage="No race found."
                              items={races}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="maritalStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="maritalStatus">Marital Status</FormLabel>
                            <GenericCombobox
                              width={"w-full"}
                              handleChange={(value) => setValue("maritalStatus", value)}
                              valueParam={field.value}
                              disabled={!isEditing || isPending}
                              className={inputClassName}
                              placeholder="Select..."
                              searchPlaceholder="Search..."
                              items={martialStatuses}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 w-full lg:max-w-[60%] items-center gap-4 px-4">
                      <FormField
                        control={control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="maritalStatus">Height</FormLabel>
                            <GenericCombobox
                              width={"w-full"}
                              handleChange={(value) => setValue("height", value)}
                              valueParam={field.value}
                              disabled={!isEditing || isPending}
                              className={cn("sm:max-w-[120px]", inputClassName)}
                              placeholder="Select..."
                              searchPlaceholder="Search..."
                              noItemsMessage="No results"
                              items={heightsImperial}
                              //   items={user.unit === Unit.IMPERIAL ? heightsImperial : heightsMetric}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="weight">Weight</FormLabel>
                            <div className="relative flex items-center">
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                type="number"
                                id="weight"
                                name="weight"
                                min={2}
                                max={1500}
                                className={cn(inputClassName, "sm:max-w-[120px]")}
                                placeholder="Weight"
                                disabled={!isEditing || isPending}
                              />
                              <span className="pl-1">lbs</span>

                              {/* <span className="pl-1"> {user.unit === Unit.IMPERIAL ? "lbs" : "Kg"}</span> */}
                            </div>
                            <FormMessage className="absolute" />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-0">
                        <div className="pb-2">
                          <Label>BMI</Label>
                        </div>
                        <Input
                          type="number"
                          id="bmi"
                          name="bmi"
                          placeholder="N/A"
                          className={cn(inputClassName, "sm:max-w-[120px]")}
                          value={
                            !!watchedHeight && !!watchedWeight
                              ? calculateBMI("IMPERIAL", watchedHeight, watchedWeight)
                              : ""
                          }
                          disabled={true}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-6">
                    <div className="space-y-2 w-full">
                      <div>
                        <h3 className="text-lg font-medium">Contact</h3>
                      </div>
                      <Separator className="bg-primary/10" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 w-full items-center gap-4 px-4">
                      <FormField
                        control={control}
                        name="mobilePhone"
                        render={({ field }) => (
                          <FormItem ref={null}>
                            <FormLabel htmlFor="mobilePhone">Mobile Phone</FormLabel>
                            <PhoneNumber
                              fieldName="mobilePhone"
                              handleChange={(value) => setValue("mobilePhone", value)}
                              number={field.value}
                              disabled={!isEditing || isPending}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="homePhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="homePhone">Home Phone</FormLabel>
                            <PhoneNumber
                              {...field}
                              fieldName="homePhone"
                              handleChange={(value) => setValue("homePhone", value)}
                              number={field.value}
                              disabled={!isEditing || isPending}
                            />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-0">
                        <div className="pb-2">
                          <Label>Email</Label>
                        </div>
                        <Input
                          id="email"
                          name="email"
                          className="bg-secondary border-primary/10"
                          value={currentUser?.email || ""}
                          disabled={true}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-6">
                    <div className="space-y-2 w-full">
                      <div>
                        <h3 className="text-lg font-medium">Address</h3>
                      </div>
                      <Separator className="bg-primary/10" />
                    </div>
                    {!watchedAddress ? (
                      <div>
                        <OpenAddressButton numOfCurrentAddresses={0} asChild addOrUpdateFunction={addOrUpdateAddress}>
                          <Button disabled={isPending || !isEditing} variant={"secondary"}>
                            Add address
                          </Button>
                        </OpenAddressButton>
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-col gap-y-1.5">
                          <div className="flex flex-row justify-between gap-2 items-center">
                            <Accordion defaultValue={["0"]} type="multiple" className="space-y-2 w-full">
                              <AccordionItem className="border-none" value={"0"}>
                                <AccordionTrigger
                                  className={cn(
                                    "text-xs sm:text-lg flex items-center gap-x-2 p-1.5 rounded-md hover:bg-neutral-500/10 transition text-start no-underline hover:no-underline",
                                  )}
                                >
                                  {watchedAddress.address}
                                </AccordionTrigger>
                                <AccordionContent className="pt-1 text-primary/70 text-md">
                                  <div className="p-4 rounded border border-secondary flex items-center gap-4">
                                    <div className="grid gap-2.5">
                                      <address className="not-italic leading-none space-y-1.5">
                                        <p>{watchedAddress.address}</p>
                                        <p>{watchedAddress.address2}</p>
                                        <p>
                                          {watchedAddress.city}, {watchedAddress.state}, {watchedAddress.zipcode}
                                        </p>
                                      </address>
                                    </div>
                                    {/* <Button size="sm">Edit</Button> */}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>

                            <>
                              <OpenAddressButton
                                numOfCurrentAddresses={1}
                                initialData={watchedAddress}
                                asChild
                                addOrUpdateFunction={addOrUpdateAddress}
                              >
                                <Button
                                  disabled={isPending || !isEditing}
                                  className="w-12 xs:w-20 h-9 items-center"
                                  variant={"outline"}
                                >
                                  <PencilLine className="w-4 h-4 xs:mr-2" />
                                  <span className="hidden xs:flex">Edit</span>
                                </Button>
                              </OpenAddressButton>
                              <Button
                                disabled={isPending || !isEditing}
                                onClick={removeAddress}
                                className="w-12 xs:w-20 h-9 text-sm bg-secondary hover:bg-[#fdf0ef] dark:hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
                              >
                                <Trash className="w-4 h-4 xs:mr-2 flex xs:hidden" />
                                <span className="hidden xs:flex">Delete</span>
                              </Button>
                            </>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent className="w-full" value="insurance">
          <InsuranceContent />
        </TabsContent>
      </div>
    </Tabs>
  );
};
