"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Dropzone } from "@/components/files/dropzone";
import { FileWithStatus } from "@/app/types/file-types";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useOrganizationStore } from "./hooks/use-organizations";

interface UploadProfilePictureButtonProps {
  organizationId: string;
  children: React.ReactNode;
  asChild?: boolean;
}

export const UploadOrganizationPictureButton = ({
  children,
  asChild,
  organizationId,
}: UploadProfilePictureButtonProps) => {
  const { patchOrganization } = useOrganizationStore();
  const [file, setFile] = useState<FileWithStatus | null>(null);
  const { isLoading, setIsLoading } = useIsLoading();

  const handleUpload = async () => {
    if (isLoading) return;
    let isError = false;
    if (!file) return;
    setIsLoading(true);

    let goodPsuResponse = false;

    try {
      const response = await fetch("/api/opp-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId,
          contentType: file.file.type,
        }),
      });
      const responseObj = await response.json();
      const { url, fields, imageUrl } = responseObj;
      if (response.ok) {
        goodPsuResponse = true;
      } else {
        isError = true;
        throw new Error(responseObj.message || "Upload failed");
      }

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append("file", file.file as any);
      const uploadResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`File upload to storage failed.`);
      } else {
        setFile(null);
        patchOrganization(organizationId, { profileImageUrl: imageUrl });
      }
    } catch (error) {
      setFile(null);
      toast.error("Something went wrong!");
    }
    setIsLoading(false);
    if (!isError) {
      //   uploadInsuranceModal.onClose();
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={asChild}>{children}</AlertDialogTrigger>
      <AlertDialogContent className="flex flex-col xs:max-w-[400px]">
        <AlertDialogTitle className="text-md">Upload organization picture</AlertDialogTitle>
        <Dropzone insuranceSide={"front"} onChangeSingleFile={setFile} />
        <div>{file?.file.name}</div>
        <AlertDialogFooter>
          <AlertDialogCancel className="w-20 h-8 text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!file || isLoading}
            onClick={() => {
              handleUpload();
            }}
            className="w-20 h-8"
          >
            Upload
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
