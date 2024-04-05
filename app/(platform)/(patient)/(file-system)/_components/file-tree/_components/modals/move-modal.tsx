"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Folder } from "lucide-react";
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
import { useIsLoading } from "@/hooks/use-is-loading";
import { cn } from "@/lib/utils";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const MoveModal = () => {
  const moveModal = useMoveModal();
  const currentUserPermissions = useCurrentUserPermissions();
  const moveNodes = moveModal.nodeDatas;
  const firstMoveNode = moveNodes ? moveNodes[0] : null;
  const foldersStore = useFolderStore();
  const singleLayerNodes = foldersStore.singleLayerNodes;
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading, setIsLoading } = useIsLoading();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onSelect = async (id: string) => {
    if (isLoading || !currentUserPermissions.canEdit) return;
    if (moveNodes) {
      const moveNodesIds = moveNodes.map((obj) => obj.id);
      const toNode = singleLayerNodes.find((node) => node.id === id);
      setIsLoading(true);

      const promise = axios
        .post("/api/patient-update", {
          selectedIds: moveNodesIds,
          targetId: id,
          updateType: "moveNode",
          fromName: parentFolder?.name,
          toName: toNode?.name,
        })
        .then(({ data }) => {
          foldersStore.moveNodes(moveNodesIds, id);
          // Success handling
        })
        .catch((error) => {
          const errorResponse = error?.response;
          const status = errorResponse.status;
          if (status >= 400 && status < 500) {
            window.location.reload();
          }
          // error = error?.response?.data || "Something went wrong";
          // console.log(error);
          // Error handling
          throw error; // Rethrow to allow the toast to catch it
        });

      toast.promise(promise, {
        loading: moveNodesIds.length === 1 ? "Moving node" : "Moving nodes",
        success: "Changes saved successfully",
        error: "Something went wrong",
        duration: 1250,
      });

      try {
        await promise; // Wait for the current promise to resolve or reject
      } catch (error) {
        // Error handling if needed
      }

      setIsLoading(false);
      moveModal.onClose();
    }
  };

  if (!isMounted || !moveNodes || !firstMoveNode) {
    return null;
  }
  const parentFolder = singleLayerNodes.find((element) => element.id === firstMoveNode.parentId);

  if (!parentFolder) {
    return null;
  }

  const isValidReceivingFolder = (node: SingleLayerNodesType2) => {
    if (node.namePath.startsWith("/Trash")) return false;
    const completeNodePath = `${node.path}${node.id}/`;
    let ret = true;
    for (let moveNode of moveNodes) {
      if (
        !node.isFile &&
        !moveNode.isFile &&
        moveNode.parentId &&
        node.id !== moveNode.parentId &&
        !completeNodePath.includes(moveNode.path)
      ) {
        continue;
      }
      if (!node.isFile && moveNode.isFile && moveNode.parentId && node.id !== moveNode.parentId) {
        continue;
      } else {
        return false;
      }
    }
    return ret;
  };
  return (
    <CommandDialog open={moveModal.isOpen} onOpenChange={moveModal.onClose}>
      {moveNodes.length === 1 ? (
        isMobile ? (
          <div>
            <div className="px-8 pt-1 text-sm text-primary/30 whitespace-normal break-all">{`(${firstMoveNode.name})`}</div>
            <CommandInput placeholder={`Move ${firstMoveNode.isFile ? "file" : "folder"} to...`} />
          </div>
        ) : (
          <CommandInput
            className={cn(!isMobile && "pr-8 truncate")}
            placeholder={`Move the ${firstMoveNode.isFile ? "file" : "folder"} "${firstMoveNode.name}" to...`}
          />
        )
      ) : (
        <CommandInput placeholder={`Move to...`} />
      )}

      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading={`Recent Folders`}>
          <CommandItem
            className="text-md text-primary/20 cursor-not-allowed aria-selected:bg-secondary aria-selected:text-primary/20"
            key={parentFolder.id}
            value={`${parentFolder.name}`}
            title={parentFolder.name}
            disabled
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
                  className={cn(
                    "text-md",
                    isLoading
                      ? "text-primary/20 cursor-not-allowed aria-selected:bg-secondary aria-selected:text-primary/20"
                      : "text-primary/70",
                  )}
                  key={node.id}
                  value={`${node.name}`}
                  title={node.name}
                  disabled={isLoading}
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
