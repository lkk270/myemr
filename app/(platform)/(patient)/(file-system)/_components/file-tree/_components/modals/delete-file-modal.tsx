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
import { useDeleteModal } from "../hooks/use-delete-node-modal";
import { useState, useEffect } from "react";
import { useFolderStore } from "../../../hooks/use-folders";
import _ from "lodash";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const DeleteModal = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const foldersStore = useFolderStore();
  const deleteModal = useDeleteModal();
  const deleteNodes = deleteModal.nodeDatas;
  const firstDeleteNode = deleteNodes ? deleteNodes[0] : null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !deleteModal || !deleteNodes || !firstDeleteNode) {
    return null;
  }

  const handleSave = async () => {
    setIsLoading(true);
    for (let deleteNode of deleteNodes) {
      const promise = axios
        .post("/api/patient-update", {
          nodeId: deleteNode.id,
          isFile: deleteNode.isFile ? true : false,
          updateType: "deleteNode",
        })
        .then(({ data }) => {
          foldersStore.deleteNode(deleteNode.id);
        })
        .catch((error) => {
          // console.log(error?.response?.data);
          // error = error?.response?.data || "Something went wrong";
          // console.log(error);
          throw error;
        });

      toast.promise(promise, {
        loading: "Deleting node...",
        success: "Node deleted successfully!",
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
    deleteModal.onClose();
  };

  return (
    <AlertDialog open={deleteModal.isOpen}>
      <AlertDialogContent className="flex flex-col xs:max-w-[360px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="whitespace-normal break-all">
            Send{" "}
            <span className={cn(deleteNodes.length === 1 && "italic")}>
              {deleteNodes.length === 1 ? firstDeleteNode.name : "selected items"}
            </span>
            {"  "}
            to trash?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {deleteNodes.length === 1
              ? firstDeleteNode.isFile
                ? "This file will be moved to trash."
                : "This folder and all its children will be moved to trash."
              : "The selected items and any of their children will be moved to trash."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={deleteModal.onClose} className="w-20 h-8 text-sm">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={() => {
              handleSave();
            }}
            className="w-20 h-8 text-sm bg-secondary hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
