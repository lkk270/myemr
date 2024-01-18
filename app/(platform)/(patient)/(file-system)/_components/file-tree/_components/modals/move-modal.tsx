"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Folder } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { SingleLayerNodesType2 } from "@/app/types/file-types";
import _ from "lodash";
import axios from "axios";
import { toast } from "sonner";

export const MoveModal = () => {
  const moveModal = useMoveModal();
  const moveNode = moveModal.nodeData;
  const foldersStore = useFolderStore();
  const singleLayerNodes = foldersStore.singleLayerNodes;
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onSelect = (id: string) => {
    if (moveNode) {
      setIsLoading(true);
      const originalFolders = _.cloneDeep(foldersStore.folders);
      foldersStore.moveNodes([moveNode.id], id);
      const promise = axios
        .post("/api/patient-update", {
          selectedIds: [moveNode.id],
          targetId: id,
          updateType: "moveNode",
        })
        .then(({ data }) => {
          setIsLoading(false);
        })
        .catch((error) => {
          foldersStore.setFolders(originalFolders);
          // error = error?.response?.data || "Something went wrong";
          // console.log(error);
          throw error;
        })
        .finally(() => {
          setIsLoading(false);
          // renameModal.onClose();
          //no need for set loading to false
          // Toggle edit mode off after operation
        });
      toast.promise(promise, {
        loading: "Moving node",
        success: "Changes saved successfully",
        error: "Something went wrong",
        duration: 1250,
      });
    }
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
      !moveNode.isFile &&
      moveNode.parentId &&
      node.id !== moveNode.parentId &&
      !completeNodePath.includes(moveNode.path)
    ) {
      return true;
    }
    if (!node.isFile && moveNode.isFile && moveNode.parentId && node.id !== moveNode.parentId) {
      return true;
    }
    return false;
  };
  return (
    <CommandDialog open={moveModal.isOpen} onOpenChange={moveModal.onClose}>
      {isMobile ? (
        <div>
          <span className="pl-3 text-sm text-primary/30 whitespace-normal break-all">{`(${moveNode.name})`}</span>
          <CommandInput placeholder={`Move ${moveNode.isFile ? "file" : "folder"} to...`} />
        </div>
      ) : (
        <CommandInput placeholder={`Move the ${moveNode.isFile ? "file" : "folder"} "${moveNode.name}" to...`} />
      )}

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
                <div className="flex flex-col">
                  <span className="break-all whitespace-normal">{parentFolder.name}</span>
                  <span
                    style={{ fontSize: "10px", lineHeight: "13.3px" }}
                    className="text-primary/40 break-all whitespace-normal"
                  >
                    {parentFolder.namePath}
                  </span>
                </div>
              </div>
              <Badge className="border-primary/10 border-[1px] flex justify-end text-primary/30" variant="outline">
                CURRENT
              </Badge>
            </div>
          </CommandItem>

          {singleLayerNodes?.map(
            (node) =>
              isValidReceivingFolder(node) && (
                <CommandItem
                  onSelect={() => onSelect(node.id)}
                  className="text-md text-primary/70"
                  key={node.id}
                  value={`${node.name}`}
                  title={node.name}
                >
                  <div className="flex gap-x-4 items-center justify-center">
                    <div className="bg-primary/10 rounded-md p-2">
                      <Folder className="flex w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="break-all whitespace-normal">{node.name}</span>
                      <span
                        style={{ fontSize: "10px", lineHeight: "13.3px" }}
                        className="text-primary/40 break-all whitespace-normal"
                      >
                        {node.namePath}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ),
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
