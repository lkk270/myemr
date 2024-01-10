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

export const DeleteModal = () => {
  const [isMounted, setIsMounted] = useState(false);
  const deleteModal = useDeleteModal();
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !deleteModal || !deleteModal.nodeData) {
    return null;
  }
  return (
    <AlertDialog open={deleteModal.isOpen} onOpenChange={deleteModal.onClose}>
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
          <AlertDialogCancel className="w-20 h-8 text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction className="w-20 h-8 text-sm bg-secondary hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
