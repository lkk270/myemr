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
import { useDeleteModal } from "../hooks/use-delete-file-modal";
import { useState, useEffect } from "react";

export const MoveModal = () => {
  const [isMounted, setIsMounted] = useState(false);
  const deleteModal = useDeleteModal();
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !deleteModal || !deleteModal.nodeData) {
    return null;
  }
  return <AlertDialog open={deleteModal.isOpen} onOpenChange={deleteModal.onClose}></AlertDialog>;
};
