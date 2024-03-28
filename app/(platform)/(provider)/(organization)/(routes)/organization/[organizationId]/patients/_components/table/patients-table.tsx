"use client";

// import { hiddenColumns, filters } from "./_data/data";
import { columns as baseColumns } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { usePatientsStore } from "../../hooks/use-patients";
import { useEffect } from "react";
import { PatientMemberType2 } from "@/app/types";
import { useMediaQuery } from "usehooks-ts";

interface DataTableProps {
  data: PatientMemberType2[];
}

export function PatientsTable({ data }: DataTableProps) {
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const { patientsSet, patients, setPatients } = usePatientsStore();

  useEffect(() => {
    setPatients(data);
    // trunk-ignore(eslint/react-hooks/exhaustive-deps)
  }, [data]);

  let filteredColumns = [...baseColumns];
  if (isMobile) {
    filteredColumns = filteredColumns.filter((column: any) => column.accessorKey !== "createdAt");
  }
  return (
    <DataTable
      showDataTableViewOptions={false}
      // filters={filters}
      // hiddenColumns={hiddenColumns}
      data={patients}
      isLoading={!patientsSet}
      columns={filteredColumns}
      // className={"xs:max-h-[calc(100vh-350px)] max-h-[calc(100vh-460px)] overflow-y-scroll"}
    />
  );
}
