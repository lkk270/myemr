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
} from "@/components/ui/alert-dialog";
import { useDeleteMedicationModal } from "../hooks/use-delete-medication-modal";
import { useEffect, useState, useTransition } from "react";
import _ from "lodash";
import { toast } from "sonner";
import { deleteMedication } from "@/lib/actions/medications";
import { useMedicationStore } from "../hooks/use-medications";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const DeleteMedicationModal = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const medicationStore = useMedicationStore();
  const deleteMedicationModal = useDeleteMedicationModal();
  const medicationToDelete = deleteMedicationModal.medication;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !medicationToDelete) {
    return null;
  }

  const handleSave = () => {
    startTransition(() => {
      deleteMedication({ id: medicationToDelete.id })
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
          } else if (data.success) {
            medicationStore.deleteMedication(medicationToDelete.id);
            deleteMedicationModal.onClose();
            toast.success("Medication deleted successfully!");
          }
        })
        .catch(() => toast.error("Something went wrong"));
    });
  };

  return (
    <AlertDialog open={deleteMedicationModal.isOpen}>
      <AlertDialogContent className="flex flex-col xs:max-w-[360px]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete <span className="whitespace-normal break-all italic">{medicationToDelete.name}</span>
            {"  ?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {"This medication will be permanently deleted. This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} onClick={deleteMedicationModal.onClose} className="w-20 h-8 text-sm">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              handleSave();
            }}
            className="w-20 h-8 text-sm bg-secondary hover:bg-[#fdf0ef] dark:hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
