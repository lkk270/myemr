"use client";

import { hiddenColumns, filters } from "../../_components/table/_data/data";
import { columns } from "../../_components/table/columns";
import { DataTable } from "@/components/table/data-table";
import { useViewMedicationModal } from "../hooks/use-view-medication-modal";
import { useNewMedicationModal } from "../hooks/use-new-medication-modal";
import { useMedicationStore } from "../hooks/use-medications";
import { useEffect } from "react";
import { MedicationType } from "@/app/types";

interface DataTableProps<TData> {
  data: MedicationType[];
}

export function CustomDataTable<TData>({ data }: DataTableProps<TData>) {
  const onOpen = useViewMedicationModal().onOpen;
  const newOnOpen = useNewMedicationModal().onOpen;
  const medicationStore = useMedicationStore();

  useEffect(() => {
    medicationStore.setMedications(data);
    // trunk-ignore(eslint/react-hooks/exhaustive-deps)
  }, [data]);

  return (
    <DataTable
      filters={filters}
      newOnOpen={newOnOpen}
      onOpen={onOpen}
      hiddenColumns={hiddenColumns}
      data={medicationStore.medications}
      columns={columns}
    />
  );
}
