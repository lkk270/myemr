"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { Trash, RefreshCw, XCircle } from "lucide-react";
import { Dropzone } from "@/components/files/dropzone";
import _ from "lodash";
import { FileWithStatus } from "@/app/types/file-types";
import { Spinner } from "@/components/loading/spinner";
import { cn, formatFileSize } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  updateRegularFileStatus,
  setHasUploadedToTrue,
} from "@/app/(platform)/(patient)/(file-system)/actions/update-status";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { Button } from "@/components/ui/button";
import { ViewUploadHistoryButton } from "@/components/temp-upload/view-upload-history-button";
import { EndSessionButton } from "@/app/(public-routes)/upload-records/[token]/_components/end-session-button";
import { createPatientNotification } from "@/lib/actions/notifications";

interface UploadFilesFormProps {
  requestRecordsCode?: {
    id: string;
    userId: string;
    createdAt: Date;
    parentFolderId: string;
    hasUploaded: boolean;
    token: string;
    expires: Date;
    isValid: boolean;
    providerEmail: string;
  };
}

export const UploadFilesForm = ({ requestRecordsCode }: UploadFilesFormProps) => {
  const currentUserPermissions = useCurrentUserPermissions();
  const [calledSetHasUploadToTrue, setCalledSetHasUploadToTrue] = useState(requestRecordsCode?.hasUploaded);
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const { isLoading, setIsLoading } = useIsLoading();

  // console.log(session);
  const updateFileStatus = (
    singleFileObj: FileWithStatus | null,
    status: "uploaded" | "error" | "canceled" | "uploading" | "gotPSU",
    index: number,
  ) => {
    if (singleFileObj) {
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.file === singleFileObj.file ? { ...file, status: status, isRetrying: false } : file,
        ),
      );
    } else {
      setFiles((prevFiles) => prevFiles.map((f, i) => (i === index ? { ...f, status: status } : f)));
    }
  };

  const handleUpload = async (singleFileObj: FileWithStatus | null = null, isForRetry = false) => {
    let errorOccurred = false;
    let numFilesSuccessfullyUploaded = 0;
    if (isLoading || (!currentUserPermissions.canUploadFiles && !requestRecordsCode)) {
      return;
    }
    if (singleFileObj && singleFileObj.status === "canceled") {
      singleFileObj.controller = new AbortController();
    }
    setIsLoading(true);

    let parentFolderName = null;
    const tempFileList = singleFileObj ? [singleFileObj] : [...files];
    // console.log(tempFileList);
    const uploadPromises = tempFileList
      .filter((fileObj) => !fileObj.status || isForRetry)
      .map(async (tempFile, index) => {
        let fileId = null;
        let goodPsuResponse = false;
        try {
          updateFileStatus(tempFile, "uploading", 0);

          const file = tempFile.file;

          let body: { fileName: string; contentType: string; size: number; accessToken?: string } = {
            fileName: file.name,
            contentType: file.type,
            size: file.size,
          };
          if (!!requestRecordsCode) {
            body.accessToken = requestRecordsCode?.token;
          }
          const response = await fetch(!!requestRecordsCode ? "/api/rr-file-upload" : "/api/tpa-file-upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            signal: tempFile.controller.signal,
          });

          updateFileStatus(tempFile, "gotPSU", 0);
          const responseObj = await response.json();
          const { url, fields, fileIdResponse, parentFolderNameResponse } = responseObj;
          parentFolderName = parentFolderNameResponse;
          fileId = fileIdResponse;

          if (response.ok) {
            goodPsuResponse = true;
          } else {
            throw new Error(responseObj.message || "Upload failed");
          }

          const formData = new FormData();
          Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value as string);
          });
          formData.append("file", file as any);

          const uploadResponse = await fetch(url, {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) throw new Error(`File upload to storage failed.`);

          const data = await updateRegularFileStatus(fileId, !!requestRecordsCode);

          if (!data.success) throw new Error(data.error || "Status update failed");
          if (!!requestRecordsCode && !calledSetHasUploadToTrue) {
            await setHasUploadedToTrue(requestRecordsCode.id);
            setCalledSetHasUploadToTrue(true);
          }
          updateFileStatus(singleFileObj, "uploaded", index);
          numFilesSuccessfullyUploaded += 1;
          return BigInt(file.size); // Return the file size on successful upload
        } catch (error) {
          errorOccurred = true;
          // console.error("Upload or status update failed for file", index, error);
          const errorMessage = error as any;
          const errorMessageStr = errorMessage.toString();
          if (errorMessageStr.includes("signal is aborted") || errorMessageStr.includes("The user aborted a request")) {
            updateFileStatus(singleFileObj, "canceled", index);
          } else {
            updateFileStatus(singleFileObj, "error", index);
          }

          return BigInt(0); // Return 0 for failed uploads, ensuring the promise always resolves
        }
      });

    try {
      const sizes = await Promise.all(uploadPromises);
    } catch (error) {
      errorOccurred = false;
      console.error("An unexpected error occurred:", error);
    }

    // if (errorOccurred) {
    //   await deleteNotUploadedFilesAndDecrement(requestRecordsCode?.userId);
    // }

    if (numFilesSuccessfullyUploaded > 0) {
      if (!!requestRecordsCode) {
        await createPatientNotification({
          notificationType: "REQUEST_RECORDS_FILE_UPLOAD",
          dynamicData: {
            parentFolderName: parentFolderName,
            email: requestRecordsCode.providerEmail,
            numOfFiles: numFilesSuccessfullyUploaded,
            requestRecordsCodeToken: requestRecordsCode.token,
          },
        });
      } else {
        await createPatientNotification({
          notificationType: "ACCESS_CODE_FILE_UPLOADED",
          dynamicData: {
            parentFolderName: parentFolderName,
            role: "UPLOAD_FILES_ONLY",
            numOfFiles: numFilesSuccessfullyUploaded,
          },
        });
      }
    }
    setIsLoading(false);
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.file !== fileToRemove));
  };

  const cancelUpload = (fileObj: FileWithStatus) => {
    fileObj.controller.abort(); // Abort the request for this specific file
    // Update the file's status to reflect the cancellation, if necessary
    // console.log("IN HERE");
    // updateFileStatus(fileObj, "canceled", -1);
  };

  return (
    <Card className="flex flex-col min-h-[calc(100vh-204px)] max-w-full w-full border border-primary/10 rounded-xl overflow-hidden">
      <div
        className={cn("w-full grid", requestRecordsCode && calledSetHasUploadToTrue ? "grid-cols-2" : "grid-cols-1")}
      >
        <ViewUploadHistoryButton asChild token={requestRecordsCode?.token}>
          <Button variant={"outline"}>View upload history</Button>
        </ViewUploadHistoryButton>
        {requestRecordsCode && calledSetHasUploadToTrue && (
          <EndSessionButton asChild codeId={requestRecordsCode?.id}>
            <Button variant={"outline"}>Complete Upload?</Button>
          </EndSessionButton>
        )}
      </div>
      <div className="flex justify-center w-full">
        <CardContent className="flex flex-col flex-grow justify-center max-w-[800px] w-full">
          <CardHeader>
            <Dropzone onChangeMulti={setFiles} className="w-full" />
          </CardHeader>

          {/* Scrollable File List */}
          <div className="overflow-y-scroll max-h-[45vh] gap-y-2 flex flex-col">
            {files.map((fileObj, index) => {
              const isEndOfUndefinedBatch =
                !fileObj.status &&
                index < files.length - 1 &&
                !!files[index + 1].status &&
                (files[index + 1].status !== "uploading" ||
                  (files[index + 1].status === "uploading" && files[index + 1].isRetrying));

              return (
                <div key={index} className="px-4">
                  {/* {isPreviousBatch && <Separator />} */}
                  <div className="flex items-center text-muted-foreground overflow-hidden">
                    {(fileObj.status === "uploading" || fileObj.status === "gotPSU") && (
                      <div className="flex-shrink-0 pr-2">
                        <Spinner size="default" loaderType={"loader2"} />
                      </div>
                    )}
                    {(fileObj.status === "error" || fileObj.status === "canceled") && (
                      <div
                        title="retry"
                        role="button"
                        className="flex-shrink-0 pr-2"
                        onClick={() => handleUpload(fileObj, true)}
                      >
                        <RefreshCw className="w-4 h-4 text-[#4f5eff]" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "text-sm flex flex-grow min-w-0",
                        fileObj.status === "uploaded" && "text-green-600",
                      )}
                    >
                      <p
                        className={cn(
                          "truncate flex-grow",
                          fileObj.status === "error" && "text-red-500",
                          fileObj.status === "canceled" && "text-amber-500",
                        )}
                      >
                        {fileObj.file.name}
                      </p>
                      <span className="flex-shrink-0 pl-2">({formatFileSize(BigInt(fileObj.file.size))})</span>
                    </div>
                    {!fileObj.status && (
                      <div role="button" className="flex-shrink-0 pl-2" onClick={() => handleRemoveFile(fileObj.file)}>
                        <Trash className="w-3 h-3 text-red-400" />
                      </div>
                    )}
                    {fileObj.status === "uploading" && (
                      <div role="button" className="flex-shrink-0 pl-2" onClick={() => cancelUpload(fileObj)}>
                        <XCircle className="w-3 h-3 text-red-400" />
                      </div>
                    )}
                  </div>
                  {isEndOfUndefinedBatch && <Separator className="mt-2 mb-1" />}
                </div>
              );
            })}
          </div>

          <CardFooter className="pt-10 justify-end">
            <Button
              disabled={isLoading || !files.some((file) => !file.status)}
              onClick={() => {
                handleUpload();
              }}
              className="w-20 h-8 text-sm"
            >
              Upload
            </Button>
          </CardFooter>
        </CardContent>
      </div>
    </Card>
  );
};
