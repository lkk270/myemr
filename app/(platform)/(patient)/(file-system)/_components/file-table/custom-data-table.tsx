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
  data.sort((a, b) => {
    // First, sort by isFile status
    if (a.isFile !== b.isFile) {
      return a.isFile ? 1 : -1;
    }
    // Then, within each group, sort by createdAt descending
    if (!b.createdAt || !a.createdAt) return 0;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  return (
    <DataTable
      // filters={filters}
      // newOnOpen={newOnOpen}
      // onOpen={onOpen}
      // hiddenColumns={hiddenColumns}
      isLink={true}
      className={"max-h-[calc(100vh-350px)] overflow-y-scroll"}
      data={data}
      isLoading={false}
      columns={columns}
    />
  );
}
