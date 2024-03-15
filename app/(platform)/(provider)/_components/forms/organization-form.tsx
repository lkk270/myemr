"use client";

import * as z from "zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Wand2, Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { AddressSchema, OrganizationSchema } from "../../schema/organization";
import { rootFolderCategories } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { GenericCombobox } from "@/components/generic-combobox";
import { PhoneNumber } from "@/components/phone-number";
import { OpenAddressButton } from "../open-address-button";
// import MultipleSelector, { Option } from "@/components/ui/multiple-selector";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const organizationTypes = [
  { value: "CLINIC", label: "Clinic" },
  { value: "CLINICAL_TRIAL", label: "Clinical Trial" },
  { value: "PRIVATE_PRACTICE", label: "Private Practice" },
];

// const TAGS: Option[] = rootFolderCategories.concat([
//   { label: "Patient first", value: "patient first" },
// ]);

interface OrganizationFormProps {
  initialData?: z.infer<typeof OrganizationSchema>;
}
export const OrganizationForm = ({ initialData }: OrganizationFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof OrganizationSchema>>({
    resolver: zodResolver(OrganizationSchema),
    defaultValues: initialData || {
      title: "",
      category: "",
      subTitle: undefined,
      description: undefined,
      backgroundImageUrl: undefined,
      profileImageUrl: undefined,
      acceptMessages: undefined,
      tags: [],
      mainEmail: undefined,
      mainPhone: undefined,
      addresses: [
        {
          id: "1",
          name: "FirstFirstFirstFirstFirstFirstFirstFirst FirstFirstFirstFirstFirst qwertyuiopoiuytredcfvbhjkhgsbdfn fllast",
          address:
            "sodfksandfksdnfklsadnflk sandflksan dflknsadlkf nasdklf mething at somet afjskdfj skdjf slkdjf sd flast last",
          address2: "200 patsdfnksdnfklsdnfsdf",
          city: "New Yordfnkasdnfklsd nfklsdf nklsdfnlksdnfk adsfkmsdklf mldskf mkdsa fmklsdamf lksdamf lkdsamflksdmf lksdfsdfsdfsdfasdflast",
          state: "NY",
          zipcode: "10028",
        },
      ],
    },
  });
  const { setValue, control, watch } = form;

  const watchedAddresses = watch("addresses");

  const onSubmit = (values: z.infer<typeof OrganizationSchema>) => {
    console.log(values);
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

  const watchedMainEmail = watch("mainEmail");

  useEffect(() => {
    if (watchedMainEmail === "") {
      setValue("mainEmail", undefined);
    }
  }, [watchedMainEmail]);

  return (
    <div className="h-full p-4 max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-10">
          <div className="space-y-2 w-full col-span-2">
            <div>
              <h3 className="text-lg font-medium">General Information</h3>
              <p className="text-sm text-muted-foreground">General information about your organization</p>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          {/* <FormField
            name="src"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center space-y-4 col-span-2">
                <FormControl>
                  <ImageUpload disabled={isPending} onChange={field.onChange} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  {/* <FormControl> */}
                  <Input disabled={isPending} placeholder="Hippocrates Associates" {...field} />
                  {/* </FormControl> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organizationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Type</FormLabel>
                  <Select
                    disabled={isPending}
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
                    disabled={isPending}
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
              name="subTitle"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle...</FormLabel>
                  {/* <FormControl> */}
                  <Textarea
                    disabled={isPending}
                    rows={2}
                    className="bg-background resize-none"
                    placeholder={"Subtitle"}
                    {...field}
                  />
                  {/* </FormControl> */}
                  <FormDescription>One line about our organization.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  {/* <FormControl> */}
                  <Textarea
                    disabled={isPending}
                    rows={5}
                    className="bg-background resize-none"
                    placeholder={"Description..."}
                    {...field}
                  />
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
              name="mainEmail"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Email</FormLabel>
                  {/* <FormControl> */}
                  <Input disabled={isPending} placeholder="Hippocrates@earth.com" {...field} />
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
                    disabled={isPending}
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
          <div>
            <OpenAddressButton numOfCurrentAddresses={watchedAddresses.length} asChild addOrUpdateFunction={addAddress}>
              <Button variant={"secondary"}>New address</Button>
            </OpenAddressButton>
          </div>
          <div>
            {watchedAddresses.map((address) => (
              <div className="flex flex-col gap-y-1.5">
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
                  <OpenAddressButton
                    numOfCurrentAddresses={watchedAddresses.length}
                    initialData={address}
                    asChild
                    addOrUpdateFunction={updateAddress}
                  >
                    <Button className="w-20 h-9 items-center" variant={"outline"}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </OpenAddressButton>
                </div>
                <Separator className="bg-primary/10" />
              </div>
            ))}
          </div>

          <div className="w-full flex justify-center pt-20">
            <Button size="lg" disabled={isPending}>
              {initialData ? "Edit your organization" : "Create a new organization"}
              <Wand2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
