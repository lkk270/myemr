"use client";

import { hiddenColumns, filters } from "./_data/data";
import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { useViewMedicationModal } from "../hooks/use-view-medication-modal";
import { useNewMedicationModal } from "../hooks/use-new-medication-modal";
import { useMedicationStore } from "../hooks/use-medications";
import { useEffect } from "react";
import { MedicationType } from "@/app/types";

interface DataTableProps {
  data: MedicationType[];
}

export function CustomDataTable({ data }: DataTableProps) {
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
      isLoading={!medicationStore.medicationsSet}
      columns={columns}
      className={"xs:max-h-[calc(100vh-350px)] max-h-[calc(100vh-460px)] overflow-y-scroll"}
    />
  );
}
