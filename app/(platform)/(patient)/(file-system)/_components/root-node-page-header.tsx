"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FolderPlus, Upload } from "lucide-react";
import { useAddFolderModal } from "./file-tree/_components/hooks";
import { useUploadFilesModal } from "./file-tree/_components/hooks/use-upload-files-modal";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useNewRootFolder } from "./hooks/use-new-root-folder";
import { RecentRecordsGrid } from "./recent-records-grid";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

interface NodePageHeaderProps {}

export const RootNodePageHeader = ({}: NodePageHeaderProps) => {
  const addFolderModal = useAddFolderModal();
  const uploadFilesModal = useUploadFilesModal();
  const { isLoading } = useIsLoading();
  const search = useNewRootFolder();
  const currentUserPermissions = useCurrentUserPermissions();

  return (
    <div className="py-3 gap-y-2 flex flex-col">
      {currentUserPermissions.canAdd && (
        <div className="flex-row flex gap-x-2">
          <Button
            title="Upload"
            disabled={isLoading}
            onClick={() => uploadFilesModal.onOpen(null, true)}
            variant="secondary"
            className={cn(
              isLoading && "cursor-not-allowed",
              "border border-primary/10 flex flex-col items-center xs:items-start justify-center w-[66px] xs:w-40 px-3 py-8",
            )}
          >
            <div className="gap-y-2 flex flex-col items-start flex-shrink-0">
              <Upload className="w-5 h-5" />
              <div className="hidden xs:flex">Upload</div>
            </div>
          </Button>
          <Button
            title="Add a subfolder"
            disabled={isLoading}
            onClick={() => addFolderModal.onOpen(null, true)}
            variant="secondary"
            className={cn(
              isLoading && "cursor-not-allowed",
              "border border-primary/10 flex flex-col items-center xs:items-start justify-center w-[66px] xs:w-40 px-3 py-8",
            )}
          >
            <div className="gap-y-2 flex flex-col items-start flex-shrink-0">
              <FolderPlus className="w-5 h-5" />
              <div className="hidden xs:flex">Add subfolder</div>
            </div>
          </Button>
          <Button
            title="New root folder"
            disabled={isLoading}
            onClick={search.onOpen}
            variant="secondary"
            className={cn(
              isLoading && "cursor-not-allowed",
              "text-[#8d4fff] xs:text-primary/80 border border-primary/10 flex flex-col items-center xs:items-start justify-center w-[66px] xs:w-40 px-3 py-8",
            )}
          >
            <div className="gap-y-2 flex flex-col items-start flex-shrink-0">
              <FolderPlus className="w-5 h-5" />
              <div className="hidden xs:flex">New Root</div>
            </div>
          </Button>
        </div>
      )}
      <RecentRecordsGrid />
    </div>
  );
};
