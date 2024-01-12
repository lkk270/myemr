"use client";

import { useEffect, useState } from "react";
import { Folder, FolderPlus, Upload, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFolderStore } from "../../../hooks/use-folders";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useMoveModal } from "../hooks/use-move-modal";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SingleLayerNodesType2 } from "@/app/types/file-types";

export const MoveModal = () => {
  const moveModal = useMoveModal();
  const moveNode = moveModal.nodeData;
  const foldersStore = useFolderStore();
  const singleLayerNodes = foldersStore.singleLayerNodes;

  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onSelect = (id: string) => {
    router.push(`/files/${id}`);
    moveModal.onClose();
  };

  if (!isMounted || !moveNode) {
    return null;
  }
  const parentFolder = singleLayerNodes.find((element) => element.id === moveNode.parentId);

  if (!parentFolder) {
    return null;
  }

  const isValidReceivingFolder = (node: SingleLayerNodesType2) => {
    const completeNodePath = `${node.path}${node.id}/`;

    if (
      !node.isFile &&
      moveNode.parentId &&
      node.id !== moveNode.parentId &&
      !completeNodePath.includes(moveNode.path)
    ) {
      return true;
    }
    return false;
  };
  return (
    <CommandDialog open={moveModal.isOpen} onOpenChange={moveModal.onClose}>
      <CommandInput placeholder={`Move the ${moveNode.isFile ? "file" : "folder"} "${moveNode.name}" to...`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading={`Recent Folders`}>
          <CommandItem
            className="text-md text-primary/20 cursor-not-allowed aria-selected:bg-secondary aria-selected:text-primary/20"
            key={parentFolder.id}
            value={`${parentFolder.name}`}
            title={parentFolder.name}
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-x-4 items-center">
                <div className="bg-primary/10 rounded-md p-2">
                  <Folder className="w-6 h-6" />
                </div>
                {parentFolder.name}
              </div>
              <Badge className="border-primary/10 border-[1px] flex justify-end text-primary/30" variant="outline">
                CURRENT
              </Badge>
            </div>
          </CommandItem>

          {singleLayerNodes?.map(
            (node) =>
              isValidReceivingFolder(node) && (
                <CommandItem className="text-md text-primary/70" key={node.id} value={`${node.name}`} title={node.name}>
                  <div className="flex gap-x-4 items-center justify-center">
                    <div className="bg-primary/10 rounded-md p-2">
                      <Folder className="flex w-6 h-6" />
                    </div>
                    {node.name}
                  </div>
                </CommandItem>
              ),
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
