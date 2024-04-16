"use client";

import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { FileWithStatus } from "@/app/types/file-types";
import { useIsLoading } from "@/hooks/use-is-loading";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { maxFileUploadSizes, maxSystemFileSize, maxFileUploadSize } from "@/lib/constants";

// Define the props expected by the Dropzone component
interface DropzoneProps {
  onChangeMulti?: React.Dispatch<React.SetStateAction<FileWithStatus[]>>;
  onChangeSingle?: (key: "front" | "back", file: FileWithStatus | null) => void;
  onChangeSingleFile?: (file: FileWithStatus | null) => void;
  className?: string;
  insuranceSide?: "front" | "back";
}

// Create the Dropzone component receiving props
export function Dropzone({
  onChangeMulti,
  onChangeSingle,
  onChangeSingleFile,
  className,
  insuranceSide,
  ...props
}: DropzoneProps) {
  const { isLoading } = useIsLoading();
  // Initialize state variables using the useState hook
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isOverArea, setIsOverArea] = useState(false);
  const [fileInfo, setFileInfo] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useCurrentUser();
  const currentUserPermissions = extractCurrentUserPermissions(currentUser);
  const title = !!insuranceSide
    ? "Click or drag a JPEG/JPG or PNG to this area to upload"
    : "Click or drag file(s) to this area to upload.";
  // Function to handle drag over event
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOverArea(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOverArea(false);
  };

  // Function to handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (isLoading) {
      toast.warning("Must wait for loading to state to finish");
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const { files } = e.dataTransfer;
    handleFiles(files);
    setIsOverArea(false);
  };

  // Function to handle file input change event
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files) {
      handleFiles(files);
      e.target.value = "";
    }
  };

  // Function to handle processing of uploaded files
  const handleFiles = (files: FileList) => {
    const maxSize =
      !!onChangeSingle || !!onChangeSingleFile
        ? maxSystemFileSize
        : !!currentUser && currentUserPermissions.isPatient
        ? maxFileUploadSizes[currentUser?.plan]
        : maxFileUploadSize;
    const maxSizeError = maxSize === maxSystemFileSize ? "10 Mb" : "5 GB";
    let newFiles: FileWithStatus[] = []; // Define as array of FileWithStatus
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > maxSize) {
        // Optionally, alert the user that the file is too large
        toast.error(`${files[i].name} is too large. Maximum file size is ${maxSizeError}.`);
        continue; // Skip this file and continue with the next one
      }
      const file = files[i];
      // Convert each File into a FileWithStatus object
      newFiles.push({ file: file, controller: new AbortController() });
    }
    setFileInfo((prevFiles) => [...newFiles.map((fws) => fws.file), ...prevFiles]);
    if (onChangeMulti) {
      onChangeMulti((prevFiles) => [...newFiles, ...prevFiles]);
    } else if (onChangeSingle && !!insuranceSide) {
      const file = { ...newFiles[0], insuranceSide: insuranceSide };
      if (!!file && file.file.type !== "image/png" && file.file.type !== "image/jpeg") {
        toast.error("Invalid file type. Must be a PNG or JPEG file!", { duration: 3000 });
        return;
      }
      // else if (file.file.size > 10_000_000) {
      //   toast.error("File cannot be greater than 10 Mb", { duration: 3000 });
      //   return;
      // }
      if (!!file) {
        onChangeSingle(insuranceSide, file);
      }
    } else if (onChangeSingleFile) {
      const file = newFiles[0];
      if (!!file && file.file.type !== "image/png" && file.file.type !== "image/jpeg") {
        toast.error("Invalid file type. Must be a PNG or JPEG file!", { duration: 3000 });
        return;
      }
      // else if (file.file.size > 10_000_000) {
      //   toast.error("File cannot be greater than 10 Mb", { duration: 3000 });
      //   return;
      // }
      if (!!file) {
        onChangeSingleFile(file);
      }
    }
    setError(null);
  };

  // Function to simulate a click on the file input element
  const handleButtonClick = () => {
    if (isLoading) {
      toast.warning("Must wait for loading to state to finish");
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <Card
        onClick={handleButtonClick}
        className={cn(
          "border-2 border-dashed bg-muted hover:cursor-pointer hover:border-muted-foreground/50",
          isOverArea && "border-muted-foreground/50",
          className,
        )}
        {...props}
      >
        <CardContent
          className="flex flex-col items-center justify-center space-y-2 px-2 py-4 text-xs"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Inbox color={"#4f5eff"} className="w-8 h-8 mb-2" />
            <span className="font-medium text-sm">{title}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept={!!insuranceSide ? `image/png, image/jpeg` : `*/*`}
              //     : `
              // image/*,audio/*,video/*,
              // .heic,.webp,.ipynb,
              // .pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx,
              // .html,.css,.js,.ts,.tsx,jsx,.md
              // .xml,.json,
              // .tif,.tiff,.bmp,.dcm,
              // .rtf,.odt,.ods,.odp,
              // .psd,.ai,
              // application/vnd.openxmlformats-officedocument.wordprocessingml.document,
              // application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
              // application/vnd.openxmlformats-officedocument.presentationml.presentation,
              // application/vnd.ms-excel,
              // application/msword,
              // application/rtf,
              // application/vnd.oasis.opendocument.text,
              // application/vnd.oasis.opendocument.spreadsheet,
              // application/vnd.oasis.opendocument.presentation,
              // application/x-dicom `

              onChange={handleFileInputChange}
              className="hidden"
              multiple={!insuranceSide}
            />
          </div>
          {/* {error && <span className="text-red-500">{error}</span>} */}
        </CardContent>
      </Card>
    </>
  );
}
