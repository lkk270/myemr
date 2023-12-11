import { DataTableRowActions } from "@/components/table/data-table-row-actions";
import { useViewMedicationModal } from "../hooks/use-view-medication-modal";
import { DataTableRowActionsProps } from "@/app/types";

export function CustomDataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const { onOpen } = useViewMedicationModal();
  return <DataTableRowActions row={row} onOpen={onOpen} />;
}
