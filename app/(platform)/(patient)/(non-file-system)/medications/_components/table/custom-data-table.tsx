"use client";

import { hiddenColumns, filters } from "../../_components/table/_data/data";
import { columns } from "../../_components/table/columns";
import { DataTable } from "@/components/table/data-table";
import { useViewMedicationModal } from "../hooks/use-view-medication-modal";
import { useNewMedicationModal } from "../hooks/use-new-medication-modal";

interface DataTableProps<TData> {
  data: TData[];
}

export function CustomDataTable<TData>({ data }: DataTableProps<TData>) {
  const onOpen = useViewMedicationModal().onOpen;
  const newOnOpen = useNewMedicationModal().onOpen;

  return (
    <DataTable
      filters={filters}
      newOnOpen={newOnOpen}
      onOpen={onOpen}
      hiddenColumns={hiddenColumns}
      data={data}
      columns={columns}
    />
  );
}
