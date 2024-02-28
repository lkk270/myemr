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
import { usePatientForManageAccount } from "@/auth/hooks/use-patient-for-manage-account";
import { useSession } from "next-auth/react";
import { profileImageUrlPrefix } from "@/lib/constants";

interface UploadProfilePictureButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const UploadProfilePictureButton = ({ children, asChild }: UploadProfilePictureButtonProps) => {
  const { data: session } = useSession();
  const [file, setFile] = useState<FileWithStatus | null>(null);
  const { patient, setPatient } = usePatientForManageAccount();
  const { isLoading, setIsLoading } = useIsLoading();

  const handleUpload = async () => {
    if (isLoading) return;
    let isError = false;
    if (!file || !patient) return;
    setIsLoading(true);

    let goodPsuResponse = false;

    try {
      const response = await fetch("/api/pp-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        if (
          !!session &&
          !!session.user &&
          (!session.user.image || (!!session.user.image && !session.user.image.startsWith(profileImageUrlPrefix)))
        ) {
          localStorage.setItem(`myEmrImageUrl${session.user?.id}`, imageUrl);
        }
        setPatient({ ...patient, imageUrl: `${imageUrl}?${new Date().getTime()}` });
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
        <AlertDialogTitle className="text-md">Upload profile picture</AlertDialogTitle>
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
