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
import { useUploadFilesModal } from "../hooks/use-upload-files-modal";
import { useFolderStore } from "../../../hooks/use-folders";
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
import { updateStatus, decrementUsedFileStorage } from "../../../../actions/update-status";
import { useIsLoading } from "@/hooks/use-is-loading";
import { GenericCombobox } from "@/components/generic-combobox";

export const UploadFilesModal = () => {
  const folderStore = useFolderStore();
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading, setIsLoading } = useIsLoading();
  const uploadFilesModal = useUploadFilesModal();
  const [parentNode, setParentNode] = useState<NodeDataType | SingleLayerNodesType2 | null>(null);

  useEffect(() => {
    if (uploadFilesModal.nodeData && !uploadFilesModal.showDropdown) {
      setParentNode(uploadFilesModal.nodeData);
    }
  }, [uploadFilesModal.nodeData, uploadFilesModal.showDropdown]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setFiles([]);
  }, [uploadFilesModal.nodeData?.id]);

  if (
    !isMounted ||
    !uploadFilesModal ||
    ((!uploadFilesModal.nodeData || !parentNode) && !uploadFilesModal.showDropdown)
  ) {
    return null;
  }

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
    console.log(tempFileList);
    const uploadPromises = tempFileList
      .filter((fileObj) => !fileObj.status || isForRetry)
      .map(async (tempFile, index) => {
        let fileId = null;
        let goodPsuResponse = false;
        try {
          console.log("IN HERE 96");
          const file = tempFile.file;

          const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              updateType: "uploadFiles",
              fileName: file.name,
              contentType: file.type,
              folderPath: "myfolder",
              size: file.size,
              parentId: parentNode?.id,
              parentNamePath: parentNode?.namePath,
              parentPath: parentNode?.path,
            }),
          });
          const responseObj = await response.json();
          const { url, fields } = responseObj;

          if (fields.key) {
            fileId = fields.key.split("/")[1];
          }
          if (response.ok) {
            console.log("GOOOD 124");
            goodPsuResponse = true;
          } else {
            console.log("BADD 129");
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

          updateFileStatus(singleFileObj, "uploaded", index);

          const data = await updateStatus(fileId);

          if (!data.success) throw new Error(data.error || "Status update failed");

          const createdFile = data.file; // Assuming this is the file information returned from updateStatus
          if (createdFile) {
            folderStore.addFile(
              createdFile.id,
              createdFile.name,
              createdFile.parentId,
              createdFile.path,
              createdFile.namePath,
              createdFile.userId,
              createdFile.uploadedByUserId,
              createdFile.uploadedByName,
              createdFile.type || "",
              createdFile.size,
            );
          }
          return BigInt(file.size); // Return the file size on successful upload
        } catch (error) {
          console.error("Upload or status update failed for file", index, error);
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
      const totalUploadedSize = sizes.reduce((acc, size) => acc + size, BigInt(0));

      if (totalUploadedSize > 0) {
        const currentUsedUploadedSize = BigInt(folderStore.usedFileStorage);
        folderStore.setUsedFileStorage(currentUsedUploadedSize + totalUploadedSize);
      }
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
    console.log("IN HERE");
    // updateFileStatus(fileObj, "canceled", -1);
  };

  const handleFolderChange = (value: string) => {
    const newParentNode = folderStore.singleLayerNodes.find((node) => node.namePath === value);
    if (!!newParentNode) {
      setParentNode(newParentNode);
    }
  };

  return (
    <AlertDialog open={uploadFilesModal.isOpen}>
      <AlertDialogContent className="flex flex-col xs:max-w-[400px] md:max-w-[500px]">
        <AlertDialogHeader>
          {uploadFilesModal.showDropdown ? (
            <AlertDialogTitle>
              <div>
                {/* <Label htmlFor="height">Height</Label> */}
                <GenericCombobox
                  valueParam={parentNode?.namePath}
                  handleChange={(value) => handleFolderChange(value)}
                  disabled={isLoading}
                  forFileSystem={true}
                  className={cn("xs:min-w-[350px] xs:max-w-[350px]")}
                  placeholder="Select parent folder"
                  searchPlaceholder="Search..."
                  noItemsMessage="No results"
                  items={folderStore.getDropdownFolders()}
                />
              </div>
            </AlertDialogTitle>
          ) : (
            <AlertDialogTitle>
              Upload files to <span className="italic whitespace-normal break-all">{parentNode?.name}</span>?
            </AlertDialogTitle>
          )}

          <Dropzone onChange={setFiles} className="w-full" fileExtension="pdf" />
        </AlertDialogHeader>

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
                      <Spinner size="default" defaultLoader={false} />
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
                    className={cn("text-sm flex flex-grow min-w-0", fileObj.status === "uploaded" && "text-green-600")}
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

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={uploadFilesModal.onClose} className="w-20 h-8 text-sm">
            {files.length > 0 && files.some((file) => file.status) ? "Done" : "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading || !files.some((file) => !file.status) || !parentNode?.id}
            onClick={() => {
              handleUpload();
            }}
            className="w-20 h-8 text-sm"
          >
            Upload
          </AlertDialogAction>
          {/* {isLoading && (
            <AlertDialogAction
              onClick={cancelUpload}
              className="w-30 h-8 text-sm bg-secondary hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
            >
              Cancel Upload
            </AlertDialogAction>
          )} */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
