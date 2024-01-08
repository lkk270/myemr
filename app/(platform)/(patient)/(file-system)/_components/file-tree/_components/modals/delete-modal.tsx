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
import { Button } from "@/components/ui/button";
import { useDeleteModal } from "../hooks/use-delete-modal";
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send {deleteModal.nodeData.name} to trash?</AlertDialogTitle>
          <AlertDialogDescription>
            {deleteModal.nodeData.isFile
              ? "This document will be moved to trash."
              : "This folder and all its children will be moved to trash."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="w-20 h-8 text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction className="w-20 h-8 text-sm">Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
