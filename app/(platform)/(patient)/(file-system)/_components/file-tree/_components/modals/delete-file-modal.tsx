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
import { useDeleteModal } from "../hooks/use-delete-file-modal";
import { useState, useEffect } from "react";
import { useFolderStore } from "../../../hooks/use-folders";
import _ from "lodash";
import axios from "axios";
import { toast } from "sonner";

export const DeleteModal = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const foldersStore = useFolderStore();
  const deleteModal = useDeleteModal();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !deleteModal || !deleteModal.nodeData) {
    return null;
  }

  const handleSave = () => {
    setIsLoading(true);
    const nodeData = deleteModal.nodeData;
    foldersStore.deleteNode(nodeData.id);
    const promise = axios
      .post("/api/patient-update", {
        nodeId: nodeData.id,
        isFile: nodeData.isFile ? true : false,
        updateType: "deleteNeode",
      })
      .then(({ data }) => {
        foldersStore.deleteNode(nodeData.id);
        setIsLoading(false);
        deleteModal.onClose();
      })
      .catch((error) => {
        console.log(error?.response?.data);
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
      loading: "Deleting node...",
      success: "Changes saved successfully",
      error: "Something went wrong",
      duration: 1250,
    });
  };

  return (
    <AlertDialog open={deleteModal.isOpen}>
      <AlertDialogContent className="flex flex-col xs:max-w-[360px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="whitespace-normal break-all">
            Send <span className="italic">{deleteModal.nodeData.name}</span> to trash?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {deleteModal.nodeData.isFile
              ? "This document will be moved to trash."
              : "This folder and all its children will be moved to trash."}
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
