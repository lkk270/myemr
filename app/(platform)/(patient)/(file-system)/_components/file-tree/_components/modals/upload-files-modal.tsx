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
import { Trash, RefreshCw } from "lucide-react";
import { Dropzone } from "@/components/files/dropzone";
import _ from "lodash";
import { FileWithStatus } from "@/app/types/file-types";
import { Spinner } from "@/components/spinner";
import { cn, formatFileSize } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { updateStatus } from "../../../../actions/update-status";

export const UploadFilesModal = () => {
  const user = useCurrentUser();
  const foldersStore = useFolderStore();
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const uploadFilesModal = useUploadFilesModal();

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    console.log(files);
  }, [files]);

  useEffect(() => {
    setFiles([]);
  }, [uploadFilesModal.nodeData?.id]);

  if (!isMounted || !uploadFilesModal || !uploadFilesModal.nodeData) {
    return null;
  }

  const updateFileStatus = (singleFileObj: FileWithStatus | null, status: "uploaded" | "error", index: number) => {
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
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    const parentNodeData = uploadFilesModal.nodeData;
    setIsLoading(true);
    // const formData = new FormData();
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
    for (let index = 0; index < tempFileList.length; index++) {
      const tempFile = tempFileList[index];
      if (!!tempFile.status && !isForRetry) {
        continue;
      }

      const file = tempFile.file;
      // formData.append("files[]", file as any);

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
          parentId: parentNodeData.id,
          parentNamePath: parentNodeData.namePath,
          parentPath: parentNodeData.path,
        }),
        signal,
      });
      const responseObj = await response.json();
      // console.log(responseObj);
      if (response.ok) {
        const { url, fields } = responseObj;
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
        formData.append("file", file as any);

        const uploadResponse = await fetch(url, {
          method: "POST",
          body: formData,
          signal,
        });

        if (uploadResponse.ok) {
          const fileId = fields.key.split("/")[1];
          updateStatus(fileId, file.size)
            .then((data) => {
              if (data.error) {
                updateFileStatus(singleFileObj, "error", index);
              }

              if (data.success && data.file) {
                updateFileStatus(singleFileObj, "uploaded", index);
                const createdFile = data.file;
                foldersStore.addFile(
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
                const newUsedFileStorage = BigInt(foldersStore.usedFileStorage) + BigInt(file.size);
                foldersStore.setUsedFileStorage(newUsedFileStorage);
              }
            })
            .catch((error) => {
              updateFileStatus(singleFileObj, "error", index);
            });
        } else {
          updateFileStatus(singleFileObj, "error", index);
        }
      } else {
        updateFileStatus(singleFileObj, "error", index);
        if (responseObj.message) {
          toast.error(responseObj.message);
        }
      }
    }
    setIsLoading(false);
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.file !== fileToRemove));
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Abort ongoing requests
    }

    setFiles((prevFiles) =>
      prevFiles.map((fileObj) => ({
        ...fileObj,
        status:
          !fileObj.isRetrying && fileObj.status == "uploading" ? null : fileObj.isRetrying ? "error" : fileObj.status,
      })),
    );
    setIsLoading(false);
    // Additional clean-up if necessary
  };

  return (
    <AlertDialog open={uploadFilesModal.isOpen}>
      <AlertDialogContent className="flex flex-col xs:max-w-[400px] md:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="whitespace-normal break-all">
            Upload files to <span className="italic">{uploadFilesModal.nodeData.name}</span>?
          </AlertDialogTitle>
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
                {isPreviousBatch && <Separator />}
                <div className="flex items-center text-muted-foreground overflow-hidden">
                  {fileObj.status === "uploading" && (
                    <div className="flex-shrink-0 pr-2">
                      <Spinner size="default" defaultLoader={false} />
                    </div>
                  )}
                  {fileObj.status === "error" && (
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
                    <p className={cn("truncate flex-grow", fileObj.status === "error" && "text-red-500")}>
                      {fileObj.file.name}
                    </p>
                    <span className="flex-shrink-0 pl-2">({formatFileSize(fileObj.file.size)})</span>
                  </div>
                  {!fileObj.status && (
                    <div role="button" className="flex-shrink-0 pl-2" onClick={() => handleRemoveFile(fileObj.file)}>
                      <Trash className="w-3 h-3 text-red-400" />
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
            disabled={isLoading || !files.some((file) => !file.status)}
            onClick={() => {
              handleUpload();
            }}
            className="w-20 h-8 text-sm"
          >
            Upload
          </AlertDialogAction>
          {isLoading && (
            <AlertDialogAction
              onClick={cancelUpload}
              className="w-30 h-8 text-sm bg-secondary hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
            >
              Cancel Upload
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
