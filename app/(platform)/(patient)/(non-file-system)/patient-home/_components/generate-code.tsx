"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GenerateCodeSchema } from "../schemas";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, Check, RefreshCw } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { AccessCodeValidTime, AccessCodeType } from "@prisma/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

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
  const [code, setCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);
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

  const onCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset the copied state after 2 seconds
  };

  const watchedValidFor = form.watch("validFor");
  const watchedAccessType = form.watch("accessType");

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
                      "text-xs lg:text-md hover:bg-primary/10",
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
                      "text-xs lg:text-md hover:bg-primary/10",
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

        <div className="flex flex-row items-center justify-center">
          <CopyToClipboard text={code} onCopy={onCopy}>
            <Button
              variant={"default"}
              className={cn(
                "inline-flex items-center text-sm font-semibold py-2 px-4 rounded-l outline-none focus:outline-none transition duration-150 ease-in-out",
                isCopied ? "border-2 border-green-500 text-green-500" : "border-2 border-transparent", // Keep border consistent
                "min-w-[130px]", // Ensure buttons have a minimum width
              )}
              onClick={(e) => e.preventDefault()}
            >
              <span className={cn("flex-1", !code && "text-muted-foreground")}>{code ? code : "CODE"}</span>{" "}
              {/* Allow code to flex within button */}
              {isCopied ? <Check className="ml-2 h-4 w-4 text-green-500" /> : <Copy className="ml-2 h-4 w-4" />}
            </Button>
          </CopyToClipboard>
          <div
            role="button"
            className="hover:font-bold inline-flex items-center text-sm font-semibold py-2 px-4 rounded-r outline-none focus:outline-none border-2 border-transparent transition duration-150 ease-in-out min-w-[130px]" // Apply consistent border and min-width
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setCode("CUNT")
              // Implement refresh/generate functionality
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Generate
          </div>
        </div>
      </form>
    </Form>
  );
};
