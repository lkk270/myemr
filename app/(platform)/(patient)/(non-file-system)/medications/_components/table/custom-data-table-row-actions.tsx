import { DataTableRowActions } from "@/components/table/data-table-row-actions";
import { useViewMedicationModal } from "../hooks/use-view-medication-modal";
import { Row } from "@tanstack/react-table";

interface CustomDataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function CustomDataTableRowActions<TData>({ row }: CustomDataTableRowActionsProps<TData>) {
  const { onOpen } = useViewMedicationModal();
  return <DataTableRowActions row={row} onOpen={onOpen} />;
}
