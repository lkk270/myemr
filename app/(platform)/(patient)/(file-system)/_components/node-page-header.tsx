"use client";

import { FolderPlus, Upload, Settings } from "lucide-react";
import { cn, getNodeHref } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFolderStore } from "./hooks/use-folders";
import Link from "next/link"; // Assuming you are using Next.js for routing
import { ActionDropdown } from "./file-tree/_components/action-dropdown";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAddFolderModal } from "./file-tree/_components/hooks";
import { useUploadFilesModal } from "./file-tree/_components/hooks/use-upload-files-modal";
import { NodeDataType } from "@/app/types/file-types";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

interface NodePageHeaderProps {
  nodeId: string;
  isFile?: boolean;
}

export const NodePageHeader = ({ nodeId, isFile = false }: NodePageHeaderProps) => {
  const currentUserPermissions = useCurrentUserPermissions();
  const router = useRouter();
  const pathname = usePathname();
  const addFolderModal = useAddFolderModal();
  const uploadFilesModal = useUploadFilesModal();
  const folderStore = useFolderStore();
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading } = useIsLoading();
  let node = folderStore.getNode(nodeId);

  const filesHomeHref = currentUserPermissions.isPatient
    ? "/files"
    : currentUserPermissions.isProvider
    ? `${pathname.split("/file")[0]}/files`
    : "/tpa-files";

  useEffect(() => {
    node = folderStore.getNode(nodeId);
    setIsMounted(true);
    if (!node) {
      router.push(filesHomeHref);
    }
  }, []);

  if (!isMounted || !node) {
    return null;
  }

  const namePath = node?.namePath;
  const path = node?.path;
  const paths = path?.split("/").slice(1);
  // Split the namePath into individual folders and remove empty entries (like the leading '/')
  const folders = namePath ? namePath.split("/").filter((folder) => folder) : [];
  const currentFolder = folders.pop();
  const foldersLength = folders.length;

  return (
    <div className="py-3 gap-y-2 flex flex-col">
      {!isFile && !node.namePath.startsWith("/Trash") && currentUserPermissions.canAdd && (
        <div className="gap-y-2 flex-row flex gap-x-2">
          <Button
            title="Upload"
            disabled={isLoading}
            onClick={() => uploadFilesModal.onOpen(node as NodeDataType, false)}
            variant="secondary"
            className={cn(
              isLoading && "cursor-not-allowed",
              "border border-primary/10 flex flex-col items-center xxs:items-start justify-center w-[66px] xxs:w-40 px-3 py-8",
            )}
          >
            <div className="gap-y-2 flex flex-col items-start flex-shrink-0">
              <Upload className="w-5 h-5" />
              <div className="hidden xxs:flex">Upload</div>
            </div>
          </Button>
          <Button
            title="Add a subfolder"
            disabled={isLoading}
            onClick={() => addFolderModal.onOpen(node as NodeDataType, false)}
            variant="secondary"
            className={cn(
              isLoading && "cursor-not-allowed",
              "border border-primary/10 flex flex-col items-center xxs:items-start justify-center w-[66px] xxs:w-40 px-3 py-8",
            )}
          >
            <div className="gap-y-2 flex flex-col items-start flex-shrink-0">
              <FolderPlus className="w-5 h-5" />
              <div className="hidden xxs:flex">Add subfolder</div>
            </div>
          </Button>
        </div>
      )}
      <div className={cn("flex flex-wrap text-xs text-muted-foreground/80", !isFile ? "mt-4" : "mt-1")}>
        {foldersLength > 0 ? (
          folders.map((folder, index) => {
            const pathSegment = paths ? paths[index] : "";
            const node = folderStore.getNode(pathSegment);
            const id = node ? node.id : null;
            const nodeHref = !!id
              ? getNodeHref(currentUserPermissions.isPatient, currentUserPermissions.isProvider, false, id, pathname)
              : "/files";
            return (
              <span key={index} style={{ marginRight: "5px" }}>
                <Link href={nodeHref} onDragStart={(e) => e.preventDefault()}>
                  <span className="hover:underline cursor-pointer">{folder}</span>
                </Link>
                {" / "}
              </span>
            );
          })
        ) : (
          <span key={0} style={{ marginRight: "5px" }}>
            <Link href={filesHomeHref} onDragStart={(e) => e.preventDefault()}>
              <span className="hover:underline cursor-pointer whitespace-normal break-all">/</span>
            </Link>
          </span>
        )}
      </div>

      {currentFolder && (
        <div className={cn("flex items-center")}>
          <div className="text-lg font-bold truncate">{currentFolder}</div>

          {currentUserPermissions.showActions && (
            <ActionDropdown
              showMenuHeader={false}
              nodeData={node}
              DropdownTriggerComponent={DropdownMenuTrigger}
              dropdownTriggerProps={{
                asChild: true,
                children: (
                  <div role="button" className="ml-2">
                    <Settings className="w-5 h-5" />
                  </div>
                ),
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
