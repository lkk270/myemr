"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GenerateCodeSchema } from "../schemas";

import { Button } from "@/components/ui/button";

import { Spinner } from "@/components/spinner";
import { Copy, Check, RefreshCw, History } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { AccessCodeValidTime, UserRole } from "@prisma/client";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { GenerateCodePopover } from "./generate-code-popover";
import { accessCode } from "../actions/generate-access-code";
import { ChooseFolderButton } from "./choose-folder-button";
import { toast } from "sonner";
import { ViewActiveCodesButton } from "./view-active-codes-button";
import { FolderNameType } from "@/app/types/file-types";
import { accessTypesText } from "@/lib/constants";

const validTimes = [
  { value: AccessCodeValidTime.MINUTE_30, label: "30 minutes" },
  { value: AccessCodeValidTime.HOUR_1, label: "1 hour" },
  { value: AccessCodeValidTime.HOUR_12, label: "12 hours" },
  { value: AccessCodeValidTime.DAY_1, label: "1 day" },
  { value: AccessCodeValidTime.WEEK_1, label: "1 week" },
];

export const GenerateCode = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [chosenFolder, setChosenFolder] = useState<FolderNameType>({ name: "", namePath: "" });
  const [isPending, startTransition] = useTransition();

  const [isCopied, setIsCopied] = useState(false);
  const form = useForm<z.infer<typeof GenerateCodeSchema>>({
    resolver: zodResolver(GenerateCodeSchema),
    defaultValues: {
      validFor: AccessCodeValidTime.MINUTE_30,
      accessType: UserRole.READ_ONLY,
      uploadToId: "",
    },
  });

  const isMobile = useMediaQuery("(max-width:640px)");
  const { setValue, control } = form;

  const handleValidForChange = (value: AccessCodeValidTime) => {
    setValue("validFor", value);
    setCode("");
  };

  const handleAccessTypeChange = (value: "UPLOAD_FILES_ONLY" | "READ_ONLY" | "READ_AND_ADD" | "FULL_ACCESS") => {
    setValue("accessType", value);
    setChosenFolder({ name: "", namePath: "" });
    setValue("uploadToId", "");
    setCode("");
  };

  const handleFolderChange = (folderId: string, folder: FolderNameType) => {
    setChosenFolder(folder);
    setValue("uploadToId", folderId);
  };

  const onCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset the copied state after 2 seconds
  };

  const onSubmit = (values: z.infer<typeof GenerateCodeSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      accessCode(values)
        .then((data) => {
          if (data?.error) {
            // form.reset();
            toast.error(data.error);
          }

          if (data?.success) {
            // form.reset();
            setSuccess(data.success);
          }

          if (data?.success && data?.code) {
            setCode(data.code);
          }
        })
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const watchedValidFor = form.watch("validFor");
  const watchedAccessType = form.watch("accessType");
  const watchedUploadToId = form.watch("uploadToId");

  return (
    <Form {...form}>
      {/*  onSubmit={form.handleSubmit(onSubmit)} */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          //dark:bg-[#161616]
          isMobile && "min-w-[98vw]",
          "relative min-h-[350px] lg:min-h-[200px] shadow-lg flex flex-col justify-between items-center px-2 sm:px-4 py-6 text-center md:px-6 bg-primary/5 dark:bg-[#161616] rounded-lg",
        )}
      >
        <div className="absolute right-0 top-0 mr-2 mt-2 flex items-center gap-x-2">
          <ViewActiveCodesButton asChild codeType="patientProfileAccessCode">
            <div role="button">
              <History />
            </div>
          </ViewActiveCodesButton>
          <GenerateCodePopover />
        </div>

        <div className="py-2">
          <h2 className="text-xl font-bold tracking-tighter sm:text-2xl">Generate a Code</h2>
          <p className="mx-auto max-w-[600px] text-gray-500 md:text-lg/relaxed lg:text-base/relaxed dark:text-gray-400">
            Generate a unique code to grant someone temporary access.
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
                {accessTypesText.map((obj, index) => (
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

        <div className="flex flex-row mb-2">
          <CopyToClipboard text={code} onCopy={onCopy}>
            <Button
              disabled={!code || isPending}
              variant={"default"}
              className={cn(
                "min-w-[130px] inline-flex items-center text-sm font-semibold px-4 rounded-l outline-none focus:outline-none transition duration-150 ease-in-out",
                isCopied ? "border-2 border-green-500 text-green-500" : "border-2 border-transparent", // Keep border consistent
              )}
              onClick={(e) => e.preventDefault()}
            >
              <span className={cn("flex-1")}>{code ? code : "CODE"}</span> {/* Allow code to flex within button */}
              {isCopied ? <Check className="ml-2 h-4 w-4 text-green-500" /> : <Copy className="ml-2 h-4 w-4" />}
            </Button>
          </CopyToClipboard>
          <Button
            disabled={isPending || (watchedAccessType === UserRole.UPLOAD_FILES_ONLY && !watchedUploadToId)}
            variant="none"
            type="submit"
            className="hover:font-bold inline-flex items-center text-sm font-semibold py-2 px-4 rounded-r outline-none focus:outline-none border-2 border-transparent transition duration-150 ease-in-out min-w-[130px]" // Apply consistent border and min-width
          >
            {isPending ? (
              <Spinner className="mr-1" size="default" loaderType={"refresh"} />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Generate
          </Button>
          {watchedAccessType === UserRole.UPLOAD_FILES_ONLY && (
            <ChooseFolderButton asChild handleChange={handleFolderChange}>
              <Button variant={"outline"}>
                {!watchedUploadToId ? (
                  "Choose folder"
                ) : (
                  <div
                    title={chosenFolder.namePath}
                    className="flex flex-col flex-grow min-w-0 items-start max-w-[100px]"
                  >
                    <span className="truncate text-left w-full">{chosenFolder.name}</span>
                    <span className="truncate text-left w-full text-xs text-primary/40">{chosenFolder.namePath}</span>
                  </div>
                )}
              </Button>
            </ChooseFolderButton>
          )}
        </div>
      </form>
    </Form>
  );
};
