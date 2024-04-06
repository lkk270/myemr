"use client";

// import { hiddenColumns, filters } from "./_data/data";
import { columns as baseColumns } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { useOrganizationsStore } from "../../hooks/use-organizations";
import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import { PatientMember } from "@prisma/client";

interface DataTableProps {
  data: PatientMember[];
}

export function OrganizationsTable({ data }: DataTableProps) {
  const isMobile = useMediaQuery("(max-width: 735px)");
  const { organizationsSet, organizations, setOrganizations } = useOrganizationsStore();

  useEffect(() => {
    setOrganizations(data);
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
      data={organizations}
      isLoading={!organizationsSet}
      columns={filteredColumns}
      // className={"xs:max-h-[calc(100vh-350px)] max-h-[calc(100vh-460px)] overflow-y-scroll"}
    />
  );
}
