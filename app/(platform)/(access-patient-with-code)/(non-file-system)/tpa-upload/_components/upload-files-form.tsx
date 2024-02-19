"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { Trash, RefreshCw, XCircle } from "lucide-react";
import { Dropzone } from "@/components/files/dropzone";
import _ from "lodash";
import { FileWithStatus, NodeDataType, SingleLayerNodesType2 } from "@/app/types/file-types";
import { Spinner } from "@/components/spinner";
import { cn, formatFileSize } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  updateRegularFileStatus,
  decrementUsedFileStorage,
} from "@/app/(platform)/(patient)/(file-system)/actions/update-status";
import { useIsLoading } from "@/hooks/use-is-loading";
import { GenericCombobox } from "@/components/generic-combobox";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export const UploadFilesForm = () => {
  const session = useSession();
  const currentUserPermissions = useCurrentUserPermissions();
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const { isLoading, setIsLoading } = useIsLoading();

  // console.log(session);
  const updateFileStatus = (
    singleFileObj: FileWithStatus | null,
    status: "uploaded" | "error" | "canceled",
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
    if (isLoading || !currentUserPermissions.canAdd) return;
    if (singleFileObj && singleFileObj.status === "canceled") {
      singleFileObj.controller = new AbortController();
    }
    setIsLoading(true);

    if (singleFileObj) {
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.file === singleFileObj.file ? { ...file, status: "uploading", isRetrying: true } : file,
        ),
      );
    } else {
      setFiles((prevFiles) =>
        prevFiles.map((fileObj) => ({
          ...fileObj,
          status: fileObj.status == null ? "uploading" : fileObj.status,
        })),
      );
    }

    const tempFileList = singleFileObj ? [singleFileObj] : [...files];
    // console.log(tempFileList);
    const uploadPromises = tempFileList
      .filter((fileObj) => !fileObj.status || isForRetry)
      .map(async (tempFile, index) => {
        let fileId = null;
        let goodPsuResponse = false;
        try {
          const file = tempFile.file;

          const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileName: file.name,
              contentType: file.type,
              size: file.size,
            }),
          });
          const responseObj = await response.json();
          const { url, fields, fileIdResponse } = responseObj;

          if (fields.key) {
            fileId = fileIdResponse;
          }
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
            signal: tempFile.controller.signal,
          });

          if (!uploadResponse.ok) throw new Error(`File upload to storage failed.`);

          const data = await updateRegularFileStatus(fileId);

          if (!data.success) throw new Error(data.error || "Status update failed");

          const createdFile = data.file; // Assuming this is the file information returned from updateStatus

          updateFileStatus(singleFileObj, "uploaded", index);

          return BigInt(file.size); // Return the file size on successful upload
        } catch (error) {
          // console.error("Upload or status update failed for file", index, error);
          const errorMessage = error as any;
          const errorMessageStr = errorMessage.toString();
          if (goodPsuResponse) {
            decrementUsedFileStorage(fileId);
          }
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
      console.error("An unexpected error occurred:", error);
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
      <div className="flex justify-center w-full">
        <CardContent className="flex flex-col flex-grow justify-center max-w-[800px]">
          <CardHeader>
            <Dropzone onChangeMulti={setFiles} className="w-full" />
          </CardHeader>

          {/* Scrollable File List */}
          <div className="overflow-y-scroll max-h-[45vh] gap-y-2 flex flex-col">
            {files.map((fileObj, index) => {
              const isPreviousBatch =
                index > 0 &&
                !!files[index - 1].status &&
                files[index - 1].status !== "uploading" &&
                !fileObj.isRetrying &&
                (!fileObj.status || fileObj.status === "uploading");

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
                    {fileObj.status === "uploading" && (
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
                      <span className="flex-shrink-0 pl-2">({formatFileSize(fileObj.file.size)})</span>
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

          <CardFooter>
            <Button
              disabled={isLoading || !files.some((file) => !file.status)}
              onClick={() => {
                handleUpload();
              }}
              className="w-20 h-8 text-sm"
            >
              Upload
            </Button>
            {/* {isLoading && (
            <AlertDialogAction
              onClick={cancelUpload}
              className="w-30 h-8 text-sm bg-secondary hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
            >
              Cancel Upload
            </AlertDialogAction>
          )} */}
          </CardFooter>
        </CardContent>
      </div>
    </Card>
  );
};
