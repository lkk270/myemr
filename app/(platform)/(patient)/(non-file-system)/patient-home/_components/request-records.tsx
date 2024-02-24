"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequestRecordsSchema } from "../schemas";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";

import { useState, useRef, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { useMediaQuery } from "usehooks-ts";
import SignaturePad from "react-signature-canvas";
import { ChooseFolderButton } from "./choose-folder-button";
import { FolderNameType } from "@/app/types/file-types";
import { generateRequestRecordsToken } from "../actions/generate-request-records-token";
import { toast } from "sonner";

export const RequestRecord = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [unMountGenericCombobox, setUnMountGenericCombobox] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [chosenFolder, setChosenFolder] = useState<FolderNameType>({ name: "", namePath: "" });

  const form = useForm<z.infer<typeof RequestRecordsSchema>>({
    resolver: zodResolver(RequestRecordsSchema),
    defaultValues: {
      providerEmail: "",
      signature: "",
      uploadToId: "",
    },
  });

  const { setValue, control } = form;

  const sigCanvas = useRef<any>({});
  const isMobile = useMediaQuery("(max-width:640px)");

  const onSignatureClear = () => {
    sigCanvas.current.clear();
    setValue("signature", "");
  };

  const onSignatureSave = () => {
    setValue("signature", sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"));
  };

  const handleFolderChange = (folderId: string, folder: FolderNameType) => {
    setChosenFolder(folder);
    setValue("uploadToId", folderId);
  };

  const onSubmit = (values: z.infer<typeof RequestRecordsSchema>) => {
    setError("");
    setSuccess("");
    setUnMountGenericCombobox(false);
    startTransition(() => {
      generateRequestRecordsToken(values)
        .then((data) => {
          if (data?.error) {
            toast.error(data.error);
          }
          if (data?.success) {
            setValue("providerEmail", "");
            onSignatureClear();
            setUnMountGenericCombobox(true);
            setValue("uploadToId", "");

            toast.success("Request sent. You have been CCed on the email.", { duration: 3500 });
          }
        })
        .catch((error) => {
          console.log(error);

          toast.error("Something went wrong");
        });
    });
  };
  const watchedProviderEmail = form.watch("providerEmail");

  const watchedSignature = form.watch("signature");
  const watchedUploadToId = form.watch("uploadToId");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          isMobile && "min-w-[98vw]",
          "py-8 shadow-lg px-4 text-center md:px-6 bg-primary/5 dark:bg-[#161616] rounded-lg",
        )}
      >
        <div className="mx-auto max-w-[750px] justify-between items-center">
          <div className="justify-between items-center">
            <div className="space-y-3">
              <h2 className="text-xl font-bold tracking-tighter sm:text-2xl">Request Your Records</h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-lg/relaxed lg:text-base/relaxed dark:text-gray-400">
                Fill out the form below to request your records. We'll send a notarized document to your provider,
                giving them 30 days to upload your records through a secure link. You won't be able to send another
                request to this provider until they complete the upload or the link expires.
              </p>
            </div>
            <div className="space-y-4 pt-10">
              <div className="grid grid-cols-2 gap-x-2">
                <FormField
                  control={control}
                  name="providerEmail"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-2">
                      <FormLabel htmlFor="provider-email">Provider's email</FormLabel>
                      <Input
                        disabled={isPending}
                        onChange={(e) => {
                          setValue("providerEmail", e.target.value);
                        }}
                        value={watchedProviderEmail}
                        id="provider-email"
                        placeholder="Provider's email"
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="uploadToId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-2">
                      <FormLabel htmlFor="destination-folder">Destination folder</FormLabel>
                      <ChooseFolderButton unMount={unMountGenericCombobox} asChild handleChange={handleFolderChange}>
                        <Button disabled={isPending} variant={"outline"} className="justify-start">
                          {!watchedUploadToId ? (
                            "Choose folder"
                          ) : (
                            <div
                              title={chosenFolder.namePath}
                              className="flex flex-col flex-grow min-w-0 items-start justify-start max-w-[100px]"
                            >
                              <span className="truncate text-left w-full">{chosenFolder.name}</span>
                              <span className="truncate text-left w-full text-xs text-primary/40">
                                {chosenFolder.namePath}
                              </span>
                            </div>
                          )}
                        </Button>
                      </ChooseFolderButton>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name="signature"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-2">
                    <FormLabel htmlFor="signature">Signature</FormLabel>
                    <div className="border-[#d6d6d6] dark:border-[#474747] border rounded-md dark:bg-[#1f1f1f] bg-[#f8f7f7]">
                      <SignaturePad
                        penColor="#4f5eff"
                        onEnd={onSignatureSave}
                        ref={sigCanvas}
                        canvasProps={{ className: "sigCanvas" }}
                      />
                    </div>
                    {watchedSignature && (
                      <Button variant={"outline"} className="w-20 text-center" onClick={onSignatureClear}>
                        Clear
                      </Button>
                    )}
                  </FormItem>
                )}
              />
              <Button disabled={isPending} className="w-full" size="lg">
                Submit
              </Button>
              <p className="text-xs text-muted-foreground">
                By clicking submit you agree to the{" "}
                <a className="underline" href="/terms">
                  terms
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};
