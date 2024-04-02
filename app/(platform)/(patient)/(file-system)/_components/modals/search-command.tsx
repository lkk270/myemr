"use client";

import { useEffect, useState } from "react";
import { Folder, FolderPlus, Upload } from "lucide-react";
import { useFolderStore } from "../hooks/use-folders";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearch } from "../hooks/use-search";
import Link from "next/link";
import { cn, getFileIcon, getNodeHref } from "@/lib/utils";
import { useAddFolderModal } from "../file-tree/_components/hooks";
import { useUploadFilesModal } from "../file-tree/_components/hooks";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { SingleLayerNodesType2 } from "@/app/types/file-types";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export const SearchCommand = () => {
  const pathname = usePathname();
  const currentUserPermissions = useCurrentUserPermissions();
  const foldersStore = useFolderStore();
  const addFolderModal = useAddFolderModal();
  const uploadFilesModal = useUploadFilesModal();

  const singleLayerNodes = foldersStore.singleLayerNodes;

  const [isMounted, setIsMounted] = useState(false);

  const toggle = useSearch((store) => store.toggle);
  const isOpen = useSearch((store) => store.isOpen);
  const onClose = useSearch((store) => store.onClose);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  if (!isMounted) {
    return null;
  }

  const actionItems = [
    {
      label: "Create a new Folder",
      icon: FolderPlus,
      action: () => {
        addFolderModal.onOpen(null, true);
        onClose();
      },
    },
    {
      label: "Upload records",
      icon: Upload,
      action: () => {
        uploadFilesModal.onOpen(null, true);
        onClose();
      },
    },
    // { label: "Back", icon: ChevronLeft, action: onClose },
  ];

  const ItemContent = ({ node }: { node: SingleLayerNodesType2 }) => {
    return (
      <CommandItem
        key={node.id}
        value={`${node.id}`}
        title={node.name}
        className={cn("text-primary/70", node.restricted && "cursor-not-allowed")}
      >
        {(() => {
          const CustomIcon = node.isFile ? getFileIcon(node.type || "") : Folder;
          return <CustomIcon className="mr-2 h-4 w-4" />;
        })()}
        <div className="flex flex-col">
          <span className="break-all whitespace-normal">{node.name}</span>
          <span
            style={{ fontSize: "10px", lineHeight: "13.3px" }}
            className="text-primary/40 break-all whitespace-normal"
          >
            {node.namePath}
          </span>
        </div>
      </CommandItem>
    );
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder={`Search records`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {currentUserPermissions.canAdd && (
          <CommandGroup heading="Actions">
            {actionItems.map((item, index) => (
              <CommandItem
                className="text-md text-primary/70 hover:text-primary "
                key={index}
                title={item.label}
                onSelect={() => item.action()}
              >
                <div className="flex gap-x-4 items-center justify-center">
                  <div className="bg-primary/10 rounded-md p-2">
                    <item.icon className="flex w-6 h-6" />
                  </div>
                  {item.label}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandGroup heading="Recent Records">
          {singleLayerNodes.length === 0 && <div className="text-primary/70 ml-2 text-sm">No records :(</div>}
          {singleLayerNodes?.map((node, index) =>
            node.restricted ? (
              <div
                key={node.id}
                className="opacity-40"
                onClick={() => {
                  if (node.restricted) {
                    toast.warning(
                      "You are out of storage, so this file is hidden. Please upgrade your plan to access it.",
                      {
                        duration: 3500,
                      },
                    );
                  }
                }}
              >
                <ItemContent node={node} />
              </div>
            ) : (
              <Link
                key={node.id}
                href={getNodeHref(
                  currentUserPermissions.isPatient,
                  currentUserPermissions.isProvider,
                  node.isFile,
                  node.id,
                  pathname,
                )}
                onClick={onClose}
                onDragStart={(e) => e.preventDefault()}
              >
                <ItemContent node={node} />
              </Link>
            ),
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
