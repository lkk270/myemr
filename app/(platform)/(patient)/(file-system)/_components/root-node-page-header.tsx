"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FolderPlus, Upload } from "lucide-react";
import { useAddFolderModal } from "./file-tree/_components/hooks";
import { useUploadFilesModal } from "./file-tree/_components/hooks/use-upload-files-modal";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useNewRootFolder } from "./hooks/use-new-root-folder";
import { RecentRecordsGrid } from "./recent-records-grid";

interface NodePageHeaderProps {}

export const RootNodePageHeader = ({}: NodePageHeaderProps) => {
  const addFolderModal = useAddFolderModal();
  const uploadFilesModal = useUploadFilesModal();
  const { isLoading } = useIsLoading();
  const search = useNewRootFolder();

  return (
    <div className="pb-4 gap-y-2 flex flex-col">
      <div className="grid grid-cols-1 xxs:grid-cols-2 gap-y-2 xs:flex-row xs:flex gap-x-2 ">
        <Button
          disabled={isLoading}
          onClick={() => uploadFilesModal.onOpen(null, true)}
          variant="secondary"
          className={cn(
            isLoading && "cursor-not-allowed",
            "border border-primary/10 flex flex-col items-start justify-center w-36 xs:w-40 px-3 py-8",
          )}
        >
          <div className="gap-y-2 flex flex-col items-start flex-shrink-0">
            <Upload className="w-5 h-5" />
            <div>Upload</div>
          </div>
        </Button>
        <Button
          disabled={isLoading}
          onClick={() => addFolderModal.onOpen(null, true)}
          variant="secondary"
          className={cn(
            isLoading && "cursor-not-allowed",
            "border border-primary/10 flex flex-col items-start justify-center w-36 xs:w-40 px-3 py-8",
          )}
        >
          <div className="gap-y-2 flex flex-col items-start flex-shrink-0">
            <FolderPlus className="w-5 h-5" />
            <div>Add subfolder</div>
          </div>
        </Button>
        <Button
          disabled={isLoading}
          onClick={search.onOpen}
          variant="secondary"
          className={cn(
            isLoading && "cursor-not-allowed",
            "border border-primary/10 flex flex-col items-start justify-center w-36 xs:w-40 px-3 py-8",
          )}
        >
          <div className="gap-y-2 flex flex-col items-start flex-shrink-0">
            <FolderPlus className="w-5 h-5" />
            <div>New Root</div>
          </div>
        </Button>
      </div>
      <RecentRecordsGrid />
    </div>
  );
};
