"use client";

import { FolderPlus, Upload, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFolderStore } from "./hooks/use-folders";
import Link from "next/link"; // Assuming you are using Next.js for routing
import { ActionDropdown } from "./file-tree/_components/action-dropdown";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface FolderHeaderProps {
  folderId: string;
}

export const FolderHeader = ({ folderId }: FolderHeaderProps) => {
  const folderStore = useFolderStore();
  const node = folderStore.getNode(folderId);
  const namePath = node?.namePath;
  const path = node?.path;
  const paths = path?.split("/").slice(1);
  // Split the namePath into individual folders and remove empty entries (like the leading '/')
  const folders = namePath ? namePath.split("/").filter((folder) => folder) : [];
  const currentFolder = folders.pop();
  const foldersLength = folders.length;
  return (
    <div className="py-4 gap-y-2 flex flex-col">
      <div className="flex gap-x-2">
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
      {foldersLength > 0 && (
        <div className="flex flex-wrap text-xs text-muted-foreground/80 mt-4">
          {folders.map((folder, index) => {
            const pathSegment = paths ? paths[index] : "";
            const node = folderStore.getNode(pathSegment);
            const id = node ? node.id : null;
            return (
              <span key={index} style={{ marginRight: "5px" }}>
                <Link href={id ? `/files/${id}` : "/files"}>
                  <span className="hover:underline cursor-pointer">{folder}</span>
                </Link>
                {" / "}
              </span>
            );
          })}
        </div>
      )}
      {currentFolder && (
        <div className={cn("flex items-center", foldersLength === 0 && "mt-4")}>
          <div className="text-lg font-bold">{currentFolder}</div>
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
        </div>
      )}
    </div>
  );
};
