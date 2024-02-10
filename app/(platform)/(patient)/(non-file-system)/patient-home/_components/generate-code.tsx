"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GenerateCodeSchema } from "../schemas";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { AccessCodeValidTime, AccessCodeType } from "@prisma/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const validTimes = [
  { value: AccessCodeValidTime.MINUTE_30, label: "30 minutes" },
  { value: AccessCodeValidTime.HOUR_1, label: "1 hour" },
  { value: AccessCodeValidTime.HOUR_12, label: "12 hours" },
  { value: AccessCodeValidTime.DAY_1, label: "1 day" },
  { value: AccessCodeValidTime.WEEK_1, label: "1 week" },
];

const accessTypes = [
  { value: AccessCodeType.READ_ONLY, label: "Read only" },
  { value: AccessCodeType.UPLOAD_FILES_ONLY, label: "Upload files only" },
  { value: AccessCodeType.READ_AND_ADD, label: "Read & Add" },
  { value: AccessCodeType.FULL_ACCESS, label: "Full access" },
];

export const GenerateCode = () => {
  const form = useForm<z.infer<typeof GenerateCodeSchema>>({
    resolver: zodResolver(GenerateCodeSchema),
    defaultValues: {
      validFor: AccessCodeValidTime.MINUTE_30,
      accessType: AccessCodeType.READ_ONLY,
    },
  });

  const isMobile = useMediaQuery("(max-width:640px)");
  const { setValue, control } = form;

  const handleValidForChange = (value: AccessCodeValidTime) => {
    setValue("validFor", value);
  };

  const handleAccessTypeChange = (value: AccessCodeType) => {
    setValue("accessType", value);
  };
  const watchedValidFor = form.watch("validFor");
  const watchedAccessType = form.watch("accessType");

  console.log(watchedValidFor);

  return (
    <Form {...form}>
      {/*  onSubmit={form.handleSubmit(onSubmit)} */}
      <form
        className={cn(
          isMobile && "min-w-[98vw]",
          "min-h-[400px] lg:min-h-[200px] shadow-lg container grid items-center px-2 sm:px-4 text-center md:px-6 bg-primary/5 dark:bg-[#1a1a1a] rounded-lg",
        )}
      >
        <div className="space-y-3 pt-2">
          <h2 className="text-xl font-bold tracking-tighter sm:text-2xl">Generate a Code</h2>
          <p className="mx-auto max-w-[600px] text-gray-500 md:text-lg/relaxed lg:text-base/relaxed dark:text-gray-400">
            Generate a unique code to grant someone access.
          </p>
        </div>
        <FormField
          control={control}
          name="validFor"
          render={({ field }) => (
            <FormItem>
              <ToggleGroup {...field} type="single" onValueChange={handleValidForChange}>
                {validTimes.map((obj, index) => (
                  <ToggleGroupItem
                    key={obj.value}
                    className={cn(
                      "text-xs lg:text-md",
                      obj.value === watchedValidFor && "data-[state=on]:bg-primary/10",
                    )}
                    value={obj.value}
                  >
                    {obj.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="accessType"
          render={({ field }) => (
            <FormItem className="text-xs lg:text-md">
              <ToggleGroup {...field} type="single" onValueChange={handleAccessTypeChange}>
                {accessTypes.map((obj, index) => (
                  <ToggleGroupItem
                    key={obj.value}
                    className={cn(
                      "text-xs lg:text-md",
                      obj.value === watchedAccessType && "data-[state=on]:bg-primary/10",
                    )}
                    value={obj.value}
                  >
                    {obj.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FormItem>
          )}
        />

        <div className="mx-auto w-full max-w-sm space-y-4">
          <div>
            <div className="flex p-6 items-center space-x-4">
              <div className="flex flex-col">
                <div className="p-0">
                  <div className="flex rounded-md border border-gray-200 items-center w-full">
                    <Input
                      className="rounded-l-md rounded-r-none border-gray-200 border-r-0 w-full"
                      placeholder="Access token"
                      type="password"
                    />
                    <Button className="rounded-l-none" variant="ghost">
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                </div>
              </div>
              <Button>Generate</Button>
            </div>
            {/* <div className="flex p-6 items-center space-x-4">
              <Button variant="ghost">Share</Button>
            </div> */}
          </div>
        </div>
      </form>
    </Form>
  );
};
