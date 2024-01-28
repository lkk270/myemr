"use client";

import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";
import { FileWithStatus } from "@/app/types/file-types";
import { cn } from "@/lib/utils";

// Define the props expected by the Dropzone component
interface DropzoneProps {
  onChange: React.Dispatch<React.SetStateAction<FileWithStatus[]>>;
  className?: string;
  fileExtension?: string;
}

// Create the Dropzone component receiving props
export function Dropzone({ onChange, className, fileExtension, ...props }: DropzoneProps) {
  // Initialize state variables using the useState hook
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isOverArea, setIsOverArea] = useState(false);
  const [fileInfo, setFileInfo] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    e.preventDefault();
    e.stopPropagation();
    const { files } = e.dataTransfer;
    handleFiles(files);
    setIsOverArea(false);
  };

  // Function to handle file input change event
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("IN HERE3");
    const { files } = e.target;
    if (files) {
      handleFiles(files);
      e.target.value = "";
    }
  };

  // Function to handle processing of uploaded files
  const handleFiles = (files: FileList) => {
    console.log(files);
    let newFiles: FileWithStatus[] = []; // Define as array of FileWithStatus
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Convert each File into a FileWithStatus object
      newFiles.push({ file: file });
    }
    console.log(newFiles);
    setFileInfo((prevFiles) => [...newFiles.map((fws) => fws.file), ...prevFiles]);
    onChange((prevFiles) => [...newFiles, ...prevFiles]);
    setError(null);
  };

  // Function to simulate a click on the file input element
  const handleButtonClick = () => {
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
            <span className="font-medium text-sm">
              Click or drag file(s) to this area to upload. 10 files can be uploaded at a time.
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept={`
              image/*,audio/*,video/*,
              .heic,.webp,.ipynb,
              .pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx,
              .html,.css,.js,.ts,.tsx,jsx,.md
              .xml,.json,
              .tif,.tiff,.bmp,.dcm,
              .rtf,.odt,.ods,.odp,
              .psd,.ai,
              application/vnd.openxmlformats-officedocument.wordprocessingml.document,
              application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
              application/vnd.openxmlformats-officedocument.presentationml.presentation,
              application/vnd.ms-excel,
              application/msword,
              application/rtf,
              application/vnd.oasis.opendocument.text,
              application/vnd.oasis.opendocument.spreadsheet,
              application/vnd.oasis.opendocument.presentation,
              application/x-dicom
            `}
              onChange={handleFileInputChange}
              className="hidden"
              multiple
            />
          </div>
          {/* {error && <span className="text-red-500">{error}</span>} */}
        </CardContent>
      </Card>
    </>
  );
}
