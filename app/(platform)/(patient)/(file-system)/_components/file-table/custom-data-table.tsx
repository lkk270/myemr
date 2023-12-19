"use client";

import { hiddenColumns, filters } from "./_data/data";
import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { useEffect } from "react";
import { MedicationType } from "@/app/types";

interface DataTableProps {
  data: MedicationType[];
}

export function CustomDataTable({ data }: DataTableProps) {
  return (
    <DataTable
      // filters={filters}
      // newOnOpen={newOnOpen}
      // onOpen={onOpen}
      // hiddenColumns={hiddenColumns}
      data={[]}
      isLoading={false}
      columns={columns}
    />
  );
}
