"use client";

import { hiddenColumns, filters } from "./_data/data";
import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { useViewMedicationModal } from "../hooks/use-view-medication-modal";
import { useNewMedicationModal } from "../hooks/use-new-medication-modal";
import { useMedicationStore } from "../hooks/use-medications";
import { useEffect } from "react";
import { MedicationType } from "@/app/types";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

interface DataTableProps {
  data: MedicationType[];
}

export function CustomDataTable({ data }: DataTableProps) {
  const currentUserPermissions = useCurrentUserPermissions();

  const { onOpen: onViewOpen } = useViewMedicationModal();
  const { onOpen: newOnOpen } = useNewMedicationModal();
  const { medications, setMedications, medicationsSet } = useMedicationStore();

  useEffect(() => {
    setMedications(data);
    // trunk-ignore(eslint/react-hooks/exhaustive-deps)
  }, [data]);

  return (
    <DataTable
      filters={filters}
      newOnOpen={currentUserPermissions.canAdd ? newOnOpen : undefined}
      onOpen={onViewOpen}
      hiddenColumns={hiddenColumns}
      data={medications}
      isLoading={!medicationsSet}
      columns={columns}
      // className={"xs:max-h-[calc(100vh-350px)] max-h-[calc(100vh-460px)] overflow-y-scroll"}
    />
  );
}
