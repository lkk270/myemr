"use client";

import { Search, FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useNewRootFolder } from "./hooks/use-new-root-folder";
export const NewRootFolderBox = () => {
  const search = useNewRootFolder();
  return (
    <div
      onClick={search.onOpen}
      role="button"
      className={cn(
        "hover:bg-primary/10 hover:text-primary/80 rounded-md px-2 py-2 group cursor-pointer text-sm bg-primary/5 flex items-center text-muted-foreground font-medium",
      )}
    >
      <div role="button" className="h-full rounded-sm mr-2">
        <FolderPlus className="h-5 w-5 shrink-0" />
      </div>

      <span className="truncate">New Root Folder</span>
    </div>
  );
};
