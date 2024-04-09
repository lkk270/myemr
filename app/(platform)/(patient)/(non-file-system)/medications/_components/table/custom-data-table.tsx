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
import { cn } from "@/lib/utils";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const targetLength = 10;

  // Using a while loop to fill the array
  while (data.length < targetLength) {
    // Make a copy of the object. This is a shallow copy.
    let newObj = { ...data[0] };

    // For a deep copy, if your object has nested objects, use:
    // let newObj = JSON.parse(JSON.stringify(myArray[0]));

    // Push the copy into the array
    data.push(newObj);
  }

  return (
    <DataTable
      filters={filters}
      newOnOpen={currentUserPermissions.canAdd ? newOnOpen : undefined}
      onOpen={onViewOpen}
      hiddenColumns={hiddenColumns}
      data={data}
      isLoading={!medicationsSet}
      columns={columns}
      className={cn(
        data.length <= 6
          ? `min-h-[${53 * data.length}px]`
          : "min-h-[300px]" && "xs:max-h-[calc(100vh-290px)] max-h-[calc(100vh-370px)] overflow-y-scroll",
      )}
    />
  );
}
