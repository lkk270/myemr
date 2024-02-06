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
import { useDeleteMedicationModal } from "../hooks/use-delete-medication-modal";
import { useState, useEffect } from "react";
import _ from "lodash";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useMedicationStore } from "../hooks/use-medications";

export const DeleteMedicationModal = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading, setIsLoading } = useIsLoading();
  const medicationStore = useMedicationStore();
  const deleteMedicationModal = useDeleteMedicationModal();
  const deleteMedication = deleteMedicationModal.medication;
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !deleteMedication) {
    return null;
  }

  const handleSave = () => {
    setIsLoading(true);
    const promise = axios
      .post("/api/patient-update", { medicationId: deleteMedication.id, updateType: "deleteMedication" })
      .then(() => {
        medicationStore.deleteMedication(deleteMedication.id);
        deleteMedicationModal.onClose();
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        setIsLoading(false);
      });

    toast.promise(promise, {
      loading: "Saving changes",
      success: "Changes saved successfully",
      error: "Something went wrong",
      duration: 1250,
    });
  };

  return (
    <AlertDialog open={deleteMedicationModal.isOpen}>
      <AlertDialogContent className="flex flex-col xs:max-w-[360px]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete <span className="whitespace-normal break-all italic">{deleteMedication.name}</span>
            {"  ?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {"This medication will be permanently deleted. This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={deleteMedicationModal.onClose} className="w-20 h-8 text-sm">
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
