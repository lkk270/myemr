"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUploadFilesModal } from "../hooks/use-upload-files-modal";
import { useFolderStore } from "../../../hooks/use-folders";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { Trash } from "lucide-react";
import { Dropzone } from "@/components/files/dropzone";
import _ from "lodash";
import { FileWithStatus } from "@/app/types/file-types";
import { Spinner } from "@/components/spinner";

export const UploadFilesModal = () => {
  const user = useCurrentUser();
  const [files, setFiles] = useState<FileWithStatus[]>([]);

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const uploadFilesModal = useUploadFilesModal();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !uploadFilesModal || !uploadFilesModal.nodeData) {
    return null;
  }

  const handleUpload = async () => {
    setIsLoading(true);
    const formData = new FormData();
    setFiles((prevFiles) =>
      prevFiles.map((fileObj) => ({
        ...fileObj,
        status: fileObj.status == null ? "uploading" : fileObj.status,
      })),
    );
    const tempFileList = [...files] as any[]; // clone the fileList
    for (let index = 0; index < tempFileList.length; index++) {
      const tempFile = tempFileList[index];
      console.log(tempFile);
      if (!!tempFile.status) {
        continue;
      }
      const file = tempFile.file;

      console.log(file);
      formData.append("files[]", file as any);

      const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: file.name, contentType: file.type, folderPath: "myfolder" }),
      });

      if (response.ok) {
        const { url, fields } = await response.json();
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
        formData.append("file", file as any);

        const uploadResponse = await fetch(url, {
          method: "POST",
          body: formData,
        });
        console.log(uploadResponse);

        if (uploadResponse.ok) {
          setFiles((prevFiles) => prevFiles.map((f, i) => (i === index ? { ...f, status: "uploaded" } : f)));

          toast.success("267 success");
        } else {
          setFiles((prevFiles) => prevFiles.map((f, i) => (i === index ? { ...f, status: "error" } : f)));

          toast.error("269");
        }
      } else {
        setFiles((prevFiles) => prevFiles.map((f, i) => (i === index ? { ...f, status: "error" } : f)));

        toast.error("272");
      }
    }
    setIsLoading(false);
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.file !== fileToRemove));
  };

  return (
    <AlertDialog open={uploadFilesModal.isOpen}>
      <AlertDialogContent className="flex flex-col xs:max-w-[400px] max-h-[100vh] overflow-y-scroll">
        <AlertDialogHeader>
          <AlertDialogTitle className="whitespace-normal break-all">
            Upload files to <span className="italic">{uploadFilesModal.nodeData.name}</span>?
          </AlertDialogTitle>
          <Dropzone onChange={setFiles} className="w-full" fileExtension="pdf" />
          {/* Display file information below the card */}
          {files.map((fileObj, index) => (
            <div key={index} className="flex items-center text-muted-foreground px-2 overflow-hidden">
              <div className="flex-shrink-0 pr-2">
                {fileObj.status === "uploading" && <Spinner size="default" defaultLoader={false} />}
              </div>
              <div className="flex flex-grow min-w-0 text-green-400">
                <p className={`text-sm truncate flex-grow ${fileObj.status === "error" ? "text-red-500" : ""}`}>
                  {fileObj.file.name}
                </p>
                <span className="text-sm flex-shrink-0 pl-2">({Math.round(fileObj.file.size / 1024)} KB)</span>
              </div>
              {!fileObj.status && (
                <div role="button" className="flex-shrink-0 pl-2" onClick={() => handleRemoveFile(fileObj.file)}>
                  <Trash className="w-3 h-3 text-red-400" />
                </div>
              )}
            </div>
          ))}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={uploadFilesModal.onClose} className="w-20 h-8 text-sm">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={() => {
              handleUpload();
            }}
            className="w-20 h-8 text-sm"
          >
            Upload
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
