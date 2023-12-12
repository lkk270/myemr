import { DataTableRowActions } from "@/components/table/data-table-row-actions";
import { useViewMedicationModal } from "../hooks/use-view-medication-modal";
import { useMedicationStore } from "../hooks/use-medications";

import { DataTableRowActionsProps, MedicationType } from "@/app/types";
import { toast } from "sonner";
import axios from "axios";

export function CustomDataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const medicationStore = useMedicationStore();
  const { onOpen } = useViewMedicationModal();
  const onConfirmFunc = () => {
    const medication = row.original as MedicationType;
    const promise = axios
      .post("/api/patient-update", { medicationId: medication.id, updateType: "deleteMedication" })
      .then(() => {
        medicationStore.deleteMedication(medication.id);
      })
      .catch((error) => {
        throw error;
      });

    toast.promise(promise, {
      loading: "Saving changes",
      success: "Changes saved successfully",
      error: "Something went wrong",
      duration: 1250,
    });
  };

  return <DataTableRowActions onConfirmFunc={onConfirmFunc} row={row} onOpen={onOpen} />;
}
