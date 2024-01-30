"use client";

import { hiddenColumns, filters } from "./_data/data";
import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { useEffect } from "react";
import { useFolderStore } from "../hooks/use-folders";
interface DataTableProps {
  nodeId: string;
}

export function CustomDataTable({ nodeId }: DataTableProps) {
  const foldersStore = useFolderStore();

  const data = foldersStore.singleLayerNodes.filter((item) => item.parentId === nodeId);

  return (
    <DataTable
      // filters={filters}
      // newOnOpen={newOnOpen}
      // onOpen={onOpen}
      // hiddenColumns={hiddenColumns}
      className={"max-h-[calc(100vh-350px)] overflow-y-scroll"}
      data={data}
      isLoading={false}
      columns={columns}
    />
  );
}
