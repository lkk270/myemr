"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
import { useTrashModal } from "../hooks/use-trash-node-modal";
import { useState, useEffect } from "react";
import { useFolderStore } from "../../../hooks/use-folders";
import _ from "lodash";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SingleLayerNodesType2 } from "@/app/types/file-types";
import { useIsLoading } from "@/hooks/use-is-loading";

export const TrashModal = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading, setIsLoading } = useIsLoading();
  const foldersStore = useFolderStore();
  const trashModal = useTrashModal();
  const trashNodes = trashModal.nodeDatas;
  const firstDeleteNode = trashNodes ? trashNodes[0] : null;
  const trashNode = foldersStore.singleLayerNodes.find((obj: SingleLayerNodesType2) => obj.namePath === "/Trash");
  const trashId = trashNode?.id;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !trashModal || !trashNodes || !firstDeleteNode || !trashNode || !trashId) {
    return null;
  }

  const handleSave = async () => {
    setIsLoading(true);
    for (let trashNode of trashNodes) {
      const promise = axios
        .post("/api/patient-update", {
          selectedIds: [trashNode.id],
          targetId: trashId,
          updateType: "trashNode",
        })
        .then(({ data }) => {
          foldersStore.moveNodes([trashNode.id], trashId);
          // Success handling
        })
        .catch((error) => {
          // Error handling
          throw error; // Rethrow to allow the toast to catch it
        });

      toast.promise(promise, {
        loading: "Sending node to trash",
        success: "Changes saved successfully",
        error: "Something went wrong",
        duration: 1250,
      });

      try {
        await promise; // Wait for the current promise to resolve or reject
      } catch (error) {
        // Error handling if needed
      }
    }
    setIsLoading(false);
    trashModal.onClose();
  };

  return (
    <AlertDialog open={trashModal.isOpen}>
      <AlertDialogContent className="flex flex-col xs:max-w-[360px]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Send{" "}
            <span className={cn("whitespace-normal break-all", trashNodes.length === 1 && "italic")}>
              {trashNodes.length === 1 ? firstDeleteNode.name : "selected items"}
            </span>
            {"  "}
            to trash?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {trashNodes.length === 1
              ? firstDeleteNode.isFile
                ? "This file will be moved to trash."
                : "This folder and all its children will be moved to trash."
              : "The selected items and any of their children will be moved to trash."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={trashModal.onClose} className="w-20 h-8 text-sm">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={() => {
              handleSave();
            }}
            className="w-20 h-8 text-sm bg-secondary hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
          >
            Trash
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
