"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMediaQuery } from "usehooks-ts";
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useUploadInsuranceModal } from "../hooks/use-upload-insurance-modal";
import { useInsuranceImages } from "../hooks/use-insurance-images";
import { Dropzone } from "@/components/files/dropzone";
import { useEffect, useState } from "react";
import { FileWithStatus } from "@/app/types/file-types";
import Image from "next/image";
import { updateInsuranceStatus } from "../../../(file-system)/actions/update-status";
import { Trash, RefreshCw, XCircle } from "lucide-react";
import { Spinner } from "@/components/spinner";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPresignedInsuranceUrl } from "../../../(file-system)/actions/get-file-psu";
import { InsuranceSide } from "@prisma/client";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const UploadInsuranceModal = () => {
  const currentUserPermissions = useCurrentUserPermissions();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading, setIsLoading } = useIsLoading();
  const uploadInsuranceModal = useUploadInsuranceModal();
  const { setInsuranceImageUrls } = useInsuranceImages();
  const [files, setFiles] = useState<{ front: FileWithStatus | null; back: FileWithStatus | null }>({
    front: null,
    back: null,
  });

  const [imageUrlsLocal, setImageUrlsLocal] = useState<{ front: string | null; back: string | null }>({
    front: null,
    back: null,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Update for the front image
    if (!!files.front?.file) {
      const frontUrl = URL.createObjectURL(files.front.file);
      setImageUrlsLocal((currentUrls) => ({ ...currentUrls, front: frontUrl }));
      // Cleanup function for the front image
      return () => URL.revokeObjectURL(frontUrl);
    }
  }, [files.front?.file]);

  useEffect(() => {
    // Update for the back image
    if (!!files.back?.file) {
      const backUrl = URL.createObjectURL(files.back.file);
      setImageUrlsLocal((currentUrls) => ({ ...currentUrls, back: backUrl }));
      // Cleanup function for the back image
      return () => URL.revokeObjectURL(backUrl);
    }
  }, [files.back?.file]); // Dependencies ensure this effect runs only when files change.

  // useEffect(() => {
  //   console.log(files);
  // }, [files]);

  if (!isMounted || !uploadInsuranceModal) {
    return null;
  }

  const updateFileStatus = (key: "front" | "back", newStatus: "uploading" | "error" | "uploaded") => {
    setFiles((prevFiles) => ({
      ...prevFiles,
      [key]: prevFiles[key] ? { ...prevFiles[key], status: newStatus } : null,
    }));
  };

  const updateFile = (key: "front" | "back", file: FileWithStatus | null) => {
    setFiles((prevFiles) => ({
      ...prevFiles,
      [key]: file,
    }));
  };

  const handleUpload = async (key: "front" | "back" | null = null, isForRetry = false) => {
    if (isLoading || !currentUserPermissions.isPatient) return;
    let isError = false;
    if (!files.front || !files.back || !files.front.insuranceSide || !files.back.insuranceSide) return;
    if (!!key && !files[key]) return;
    setIsLoading(true);
    if (!key) {
      updateFileStatus("front", "uploading");
      updateFileStatus("back", "uploading");
    } else {
      updateFileStatus(key, "uploading");
    }

    const tempFileList = !!key ? [files[key]] : [files.front, files.back];

    // console.log(tempFileList);
    const uploadPromises = tempFileList

      .filter((fileObj) => !!fileObj && (!fileObj.status || isForRetry))
      .map(async (tempFile, index) => {
        let fileId = null;
        let goodPsuResponse = false;
        const imageUrls: { front: string | null; back: string | null } = { front: null, back: null };
        const insuranceSide = tempFile?.insuranceSide;

        const keyToUse = !!key ? key : (insuranceSide as "front" | "back");
        try {
          const side = insuranceSide === "front" ? InsuranceSide.FRONT : InsuranceSide.BACK;
          const file = tempFile?.file;
          if (!file || !insuranceSide) throw new Error("NO FILE");
          const response = await fetch("/api/insurance-upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              side: side,
              contentType: file.type,
              size: file.size,
            }),
          });
          const responseObj = await response.json();
          const { url, fields, fileIdResponse, updateStatusRequired } = responseObj;

          if (response.ok) {
            goodPsuResponse = true;
          } else {
            isError = true;
            throw new Error(responseObj.message || "Upload failed");
          }

          if (fields.key) {
            fileId = fileIdResponse;
          }

          const formData = new FormData();
          Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value as string);
          });
          formData.append("file", file as any);

          const uploadResponse = await fetch(url, {
            method: "POST",
            body: formData,
            signal: tempFile.controller.signal,
          });

          if (!uploadResponse.ok) throw new Error(`File upload to storage failed.`);
          if (updateStatusRequired) {
            const data = await updateInsuranceStatus(fileId);

            if (!data.success) throw new Error(data.error || "Status update failed");
          }
          const imageS3Data = await getPresignedInsuranceUrl(side);
          const imageUrl = imageS3Data.presignedUrl;
          if (imageUrl) imageUrls[insuranceSide] = imageUrl;

          updateFileStatus(keyToUse, "uploaded");

          return BigInt(file.size); // Return the file size on successful upload
        } catch (error) {
          isError = true;
          const errorMessage = error as any;
          updateFileStatus(keyToUse, "error");

          return BigInt(0); // Return 0 for failed uploads, ensuring the promise always resolves
        }
      });
    try {
      const sizes = await Promise.all(uploadPromises);
    } catch (error) {
      isError = true;
      console.error("An unexpected error occurred:", error);
    }
    setIsLoading(false);
    if (!isError) {
      setInsuranceImageUrls(imageUrlsLocal);
      setImageUrlsLocal({ front: null, back: null });
      // setFiles({ front: null, back: null });
      uploadInsuranceModal.onClose();
    }
  };

  return (
    <AlertDialog open={uploadInsuranceModal.isOpen}>
      <AlertDialogContent className="flex flex-col w-full sm:max-w-[640px] overflow-y-scroll h-5/6 sm:h-3/4">
        <div className="flex flex-col justify-between h-full">
          <AlertDialogHeader>
            <AlertDialogTitle>Upload Insurance card</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex-grow flex items-center justify-center">
            <div className="w-full">
              <div className="grid grid-cols-1 justify-center items-center gap-4">
                <Card className="w-full">
                  <CardHeader className="text-base font-semibold">
                    <div className="flex flex-row gap-x-2">
                      <span
                        className={cn(
                          !!imageUrlsLocal.front && files.front?.status === "error" && "text-red-500",
                          !!imageUrlsLocal.front && files.front?.status === "uploaded" && "text-green-600",
                        )}
                      >
                        Front
                      </span>
                      {files.front && !files.front.status && !isLoading && (
                        <div role="button" onClick={() => updateFile("front", null)}>
                          <X className="h-6 w-6 text-muted-foreground rounded-sm" />
                        </div>
                      )}
                      {files.front && files.front.status === "uploading" && (
                        <div className="pt-1">
                          <Spinner size="default" loaderType={"loader2"} />
                        </div>
                      )}
                      {files.front && files.front.status === "error" && (
                        <div title="retry" role="button" className="pt-1" onClick={() => handleUpload("front", true)}>
                          <RefreshCw className="w-4 h-4 text-[#4f5eff]" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    {files.front && !!imageUrlsLocal["front"] ? (
                      <Image
                        className="w-[1/3]"
                        draggable={false}
                        height={isMobile ? 50 : 100}
                        width={isMobile ? 200 : 400}
                        src={imageUrlsLocal["front"]}
                        alt="Front of insurance card"
                      />
                    ) : (
                      <Dropzone insuranceSide={"front"} onChangeSingle={updateFile} />
                    )}
                  </CardContent>
                </Card>
                <Card className="w-full">
                  <CardHeader className="text-base font-semibold">
                    <div className="flex flex-row gap-x-2">
                      <span
                        className={cn(
                          !!imageUrlsLocal.back && files.back?.status === "error" && "text-red-500",
                          !!imageUrlsLocal.back && files.back?.status === "uploaded" && "text-green-600",
                        )}
                      >
                        Back
                      </span>
                      {files.back && !files.back.status && !isLoading && (
                        <div role="button" onClick={() => updateFile("back", null)}>
                          <X className="h-6 w-6 text-muted-foreground rounded-sm" />
                        </div>
                      )}
                      {files.back && files.back.status === "uploading" && (
                        <div className="pt-1">
                          <Spinner size="default" loaderType={"loader2"} />
                        </div>
                      )}
                      {files.back && files.back.status === "error" && (
                        <div title="retry" role="button" className="pt-1" onClick={() => handleUpload("back", true)}>
                          <RefreshCw className="w-4 h-4 text-[#4f5eff]" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    {files.back && !!imageUrlsLocal["back"] ? (
                      <Image
                        className="w-[1/3]"
                        draggable={false}
                        height={isMobile ? 50 : 100}
                        width={isMobile ? 200 : 400}
                        src={imageUrlsLocal["back"]}
                        alt="Back of insurance card"
                      />
                    ) : (
                      <Dropzone insuranceSide={"back"} onChangeSingle={updateFile} />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <AlertDialogFooter className="justify-end items-end py-2">
            <AlertDialogCancel disabled={isLoading} onClick={uploadInsuranceModal.onClose} className="w-20 h-8 text-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!files.front || !files.back || isLoading || !!files.front.status || !!files.back.status}
              onClick={() => {
                handleUpload();
              }}
              className="w-20 h-8 text-sm"
            >
              Upload
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
