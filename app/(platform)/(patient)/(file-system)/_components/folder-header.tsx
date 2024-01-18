"use client";

import { FolderPlus, Upload } from "lucide-react";
// import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FolderHeaderProps {}

export const FolderHeader = ({}: FolderHeaderProps) => {
  return (
    <div className="flex gap-x-2 py-4">
      <Button
        variant="secondary"
        className="border border-primary/10 flex flex-col items-start justify-center w-36 xs:w-40 px-3 py-8"
      >
        <div className="gap-y-2 flex flex-col items-start flex-shrink-0">
          <Upload className="w-5 h-5" />
          <div>Upload</div>
        </div>
      </Button>
      <Button
        variant="secondary"
        className="border border-primary/10 flex flex-col items-start justify-center w-36 xs:w-40 px-3 py-8"
      >
        <div className="gap-y-2 flex flex-col items-start flex-shrink-0">
          <FolderPlus className="w-5 h-5" />
          <div>Add subfolder</div>
        </div>
      </Button>
    </div>
  );
};
