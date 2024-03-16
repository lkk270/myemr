"use client";

import * as z from "zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, usePathname } from "next/navigation";
import { Ban, PackagePlus, PencilLine, Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { AddressSchema, OrganizationSchema } from "../../schema/organization";
import { rootFolderCategories } from "@/lib/constants";
import { cn, findChangesBetweenObjects } from "@/lib/utils";
import { GenericCombobox } from "@/components/generic-combobox";
import { PhoneNumber } from "@/components/phone-number";
import { OpenAddressButton } from "../open-address-button";
// import MultipleSelector, { Option } from "@/components/ui/multiple-selector";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { createOrganization, editOrganization } from "../../actions/organization";
import { logout } from "@/auth/actions/logout";
import { useOrganizationStore } from "../hooks/use-organizations";
import { OrganizationWithRoleType } from "@/app/types/organization-types";

import { initial } from "lodash";
const organizationTypes = [
  { value: "CLINIC", label: "Clinic" },
  { value: "CLINICAL_TRIAL", label: "Clinical Trial" },
  { value: "PRIVATE_PRACTICE", label: "Private Practice" },
];

// const TAGS: Option[] = rootFolderCategories.concat([
//   { label: "Patient first", value: "patient first" },
// ]);

interface OrganizationFormProps {
  initialData?: OrganizationWithRoleType;
}
export const OrganizationForm = ({ initialData }: OrganizationFormProps) => {
  const pathname = usePathname();
  const organizationId = pathname.split("/organization/")[1].split("/")[0];

  const { addOrganization } = useOrganizationStore();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  // console.log(initialData);
  const form = useForm<z.infer<typeof OrganizationSchema>>({
    resolver: zodResolver(OrganizationSchema),
    defaultValues: !!initialData
      ? {
          title: initialData.title,
          category: initialData.category,
          organizationType: initialData.organizationType,
          subTitle: initialData.subTitle || undefined,
          description: initialData.description || undefined,
          backgroundImageUrl: initialData.backgroundImageUrl || undefined,
          profileImageUrl: initialData.profileImageUrl || undefined,
          acceptMessages: initialData.acceptMessages,
          mainEmail: initialData.mainEmail || undefined,
          mainPhone: initialData.mainPhone || undefined,
          addresses: initialData.addresses,
        }
      : {
          title: "",
          category: "",
          subTitle: undefined,
          description: undefined,
          backgroundImageUrl: undefined,
          profileImageUrl: undefined,
          acceptMessages: undefined,
          organizationType: undefined,
          // tags: [],
          mainEmail: undefined,
          mainPhone: undefined,
          addresses: [],
        },
  });
  const { setValue, control, watch } = form;

  const watchedAddresses = watch("addresses");

  const onSubmitForCreateOrganization = (values: z.infer<typeof OrganizationSchema>) => {
    createOrganization(values)
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          if (data.error === "Unauthorized") {
            // newMedicationModal.onClose();
            logout();
          }
        }
        if (data.success) {
          // newMedicationModal.onClose();
          toast.success("Organization successfully added!");
        }
      })
      .catch((e) => {
        console.log(e);
        toast.error("Something went wrong");
      });
  };

  const onSubmitForEditOrganization = (values: z.infer<typeof OrganizationSchema>) => {
    editOrganization(values, organizationId)
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          if (data.error === "Unauthorized") {
            // newMedicationModal.onClose();
            logout();
          }
        }
        if (data.success) {
          // newMedicationModal.onClose();
          toast.success("Organization successfully updated!");
        }
      })
      .catch((e) => {
        console.log(e);
        toast.error("Something went wrong");
      });
  };

  const onSubmit = (values: z.infer<typeof OrganizationSchema>) => {
    let nonAddressChanges: any = {};
    let addressChanges: any = {};

    console.log(values);
    if (!!initialData) {
      const { addresses: initialDataAddresses, ...initialDataNonAddressesObj } = initialData;
      const { addresses, ...nonAddressesObj } = values;

      nonAddressChanges = findChangesBetweenObjects(initialDataNonAddressesObj, nonAddressesObj);
      const nonAddressChangesLength = Object.keys(nonAddressChanges).length;

      let addressesChanged = values.addresses.some((address) => {
        address.id.includes("new-address-") || values.addresses.length !== initialDataAddresses?.length;
      }); //are new addresses means that they've changed

      if (!addressesChanged && !!initialDataAddresses) {
        const limit = Math.min(addresses.length, initialDataAddresses.length);
        for (let i = 0; i < limit; i++) {
          const changes = findChangesBetweenObjects(initialDataAddresses[i], addresses[i]);
          const changesLength = Object.keys(changes).length;
          if (changesLength > 0) {
            addressesChanged = true;
            break;
          }
        }
      }
      if (nonAddressChangesLength === 0 && !addressesChanged) {
        setIsEditing(false);
        return;
      }
    }
    startTransition(() => {
      if (!!initialData) {
        console.log(nonAddressChanges);
        console.log(addressChanges);
        onSubmitForEditOrganization(values);
      } else {
        onSubmitForCreateOrganization(values);
      }
    });
  };

  const addAddress = (newAddress: z.infer<typeof AddressSchema>) => {
    const updatedAddresses = [...watchedAddresses, newAddress];
    setValue("addresses", updatedAddresses);
  };

  const updateAddress = (updatedAddress: z.infer<typeof AddressSchema>) => {
    // Get the current state of the addresses array
    const currentAddresses = watch("addresses");
    const index = currentAddresses.findIndex((address) => address.id === updatedAddress.id);
    const updatedAddresses = [
      ...currentAddresses.slice(0, index),
      updatedAddress,
      ...currentAddresses.slice(index + 1),
    ];
    setValue("addresses", updatedAddresses);
  };

  const removeAddress = (addressId: string) => {
    const updatedAddresses = watchedAddresses.filter((address) => address.id !== addressId);
    setValue("addresses", updatedAddresses);
  };

  const watchedMainEmail = watch("mainEmail");

  useEffect(() => {
    if (watchedMainEmail === "") {
      setValue("mainEmail", undefined);
    }
  }, [watchedMainEmail]);

  // console.log(initialData);

  const handleEditToggle = (e: any) => {
    e.preventDefault();
    if (isEditing) {
      form.reset();
      toast("No changes made");
    }
    setIsEditing(!isEditing);
  };

  const editingAllowed =
    (!!initialData && (initialData.role === "OWNER" || initialData.role === "ADMIN")) || !initialData;
  return (
    <div className="h-full p-4 max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-10">
          <div className="space-y-2 w-full col-span-2">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col">
                <h3 className="text-lg font-medium">General Information</h3>
                <p className="text-sm text-muted-foreground">General information about your organization</p>
              </div>
              {editingAllowed && (
                <Button className="w-32 h-9 items-center" variant={"outline"} onClick={handleEditToggle}>
                  {isEditing ? <Ban className="w-4 h-4 mr-2" /> : <PencilLine className="w-4 h-4 mr-2" />}
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              )}
            </div>

            <Separator className="bg-primary/10" />
          </div>
          {/* <FormField
            name="src"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center space-y-4 col-span-2">
                <FormControl>
                  <ImageUpload disabled={isPending || !isEditing} onChange={field.onChange} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              disabled={isPending || !isEditing}
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  {/* <FormControl> */}
                  <Input placeholder="Hippocrates Associates" {...field} />
                  {/* </FormControl> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isPending || !isEditing}
              control={form.control}
              name="organizationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Type</FormLabel>
                  <Select
                    disabled={isPending || !isEditing}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    {/* <FormControl> */}
                    <SelectTrigger className="bg-background hover:bg-[#f0f0f0] dark:hover:bg-[#2b2b2b]">
                      <SelectValue defaultValue={field.value} placeholder="Organization type" />
                    </SelectTrigger>
                    {/* </FormControl> */}
                    <SelectContent>
                      {organizationTypes.map((organizationType) => (
                        <SelectItem key={organizationType.value} value={organizationType.value}>
                          {organizationType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Cannot be changed later.</FormDescription>
                  {/* <FormMessage /> */}
                </FormItem>
              )}
            />
            <FormField
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="category">Category</FormLabel>
                  <GenericCombobox
                    valueParam={field.value}
                    handleChange={(value) => setValue("category", value)}
                    disabled={isPending || !isEditing}
                    className={cn(
                      "bg-black-300 font-normal min-w-[calc(100vw-90px)]  w-full sm:max-w-[843px] sm:min-w-[300px]",
                    )}
                    placeholder="Select a category..."
                    searchPlaceholder="Search..."
                    noItemsMessage="No Category found."
                    items={rootFolderCategories}
                    transparentPopoverBg={true}
                  />
                  <FormDescription>Cannot be changed later.</FormDescription>
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem className="max-w-[300px]">
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      maxSelected={8}
                      creatable={true}
                      onMaxSelected={() => {
                        toast.error("Maximum of 8 tags allowed");
                      }}
                      value={field.value}
                      onChange={field.onChange}
                      defaultOptions={TAGS}
                      placeholder="Choose tags"
                      emptyIndicator={
                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                          no results found.
                        </p>
                      }
                    />
                    <FormMessage />
                  </FormControl>
                </FormItem>
              )}
            /> */}
          </div>
          <div className="flex flex-col gap-4">
            <FormField
              disabled={isPending || !isEditing}
              name="subTitle"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle...</FormLabel>
                  {/* <FormControl> */}
                  <Textarea rows={2} className="bg-background resize-none" placeholder={"Subtitle"} {...field} />
                  {/* </FormControl> */}
                  <FormDescription>One line about our organization.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              disabled={isPending || !isEditing}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  {/* <FormControl> */}
                  <Textarea rows={5} className="bg-background resize-none" placeholder={"Description..."} {...field} />
                  {/* </FormControl> */}
                  <FormDescription>
                    Describe your organization further and provide any relevant details.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2 w-full">
            <div>
              <h3 className="text-lg font-medium">Contact Information</h3>
              <p className="text-sm text-muted-foreground">
                Viewable to any patient connected to your organization (both are optional)
              </p>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              disabled={isPending || !isEditing}
              name="mainEmail"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Email</FormLabel>
                  {/* <FormControl> */}
                  <Input placeholder="Hippocrates@earth.com" {...field} />
                  {/* </FormControl> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="mainPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="mainPhone">Main Phone</FormLabel>
                  <PhoneNumber
                    {...field}
                    fieldName="mainPhone"
                    className="border-primary/10"
                    handleChange={(value) => setValue("mainPhone", value)}
                    number={field.value}
                    disabled={isPending || !isEditing}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2 w-full">
            <div>
              <h3 className="text-lg font-medium">Addresses</h3>
              <p className="text-sm text-muted-foreground">Viewable to any patient connected to your organization</p>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          {editingAllowed && (
            <div>
              <OpenAddressButton
                numOfCurrentAddresses={watchedAddresses.length}
                asChild
                addOrUpdateFunction={addAddress}
              >
                <Button disabled={isPending || !isEditing} variant={"secondary"}>
                  New address
                </Button>
              </OpenAddressButton>
            </div>
          )}
          <div>
            {watchedAddresses.map((address) => (
              <div className="flex flex-col gap-y-1.5" key={address.id}>
                <div className="flex flex-row justify-between gap-2 items-center">
                  <Accordion type="multiple" className="space-y-2 w-full">
                    <AccordionItem className="border-none" value={address.id}>
                      <AccordionTrigger
                        className={cn(
                          "flex items-center gap-x-2 p-1.5 rounded-md hover:bg-neutral-500/10 transition text-start no-underline hover:no-underline",
                        )}
                      >
                        {address.name}
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 text-primary/70 text-md">
                        <div className="p-4 rounded border border-secondary flex items-center gap-4">
                          <div className="grid gap-2.5">
                            <p className="font-semibold leading-none">{address.name}</p>
                            <address className="not-italic leading-none space-y-1.5">
                              <p>{address.address}</p>
                              <p>{address.address2}</p>
                              <p>
                                {address.city}, {address.state}, {address.zipcode}
                              </p>
                            </address>
                          </div>
                          {/* <Button size="sm">Edit</Button> */}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  {editingAllowed && (
                    <>
                      <OpenAddressButton
                        numOfCurrentAddresses={watchedAddresses.length}
                        initialData={address}
                        asChild
                        addOrUpdateFunction={updateAddress}
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
                        onClick={() => removeAddress(address.id)}
                        className="w-12 xs:w-20 h-9 text-sm bg-secondary hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
                      >
                        <Trash className="w-4 h-4 xs:mr-2 flex xs:hidden" />
                        <span className="hidden xs:flex">Delete</span>
                      </Button>
                    </>
                  )}
                </div>
                <Separator className="bg-primary/10" />
              </div>
            ))}
          </div>

          <div className="w-full flex justify-center pt-4 xs:pt-20 pb-20 xs:pb-0">
            <Button type="submit" size="lg" disabled={isPending || !isEditing}>
              {initialData ? "Edit your organization" : "Create a new organization"}
              {initialData ? <PencilLine className="w-4 h-4 ml-2" /> : <PackagePlus className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
