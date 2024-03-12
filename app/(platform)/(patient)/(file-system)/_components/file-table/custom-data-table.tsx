"use client";

import { hiddenColumns, filters } from "./_data/data";
import { columns } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { useEffect, useState } from "react";
import { useFolderStore } from "../hooks/use-folders";
import { cn } from "@/lib/utils";
interface DataTableProps {
  nodeId: string;
}

export function CustomDataTable({ nodeId }: DataTableProps) {
  const { singleLayerNodes, updateLastViewedAt } = useFolderStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isMounted) {
      updateLastViewedAt(nodeId);
    }
  }, [nodeId, isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const data = singleLayerNodes.filter((item) => item.parentId === nodeId);
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
      className={cn(
        data.length <= 6
          ? `min-h-[${53 * data.length}px]`
          : "min-h-[300px]" && "xs:max-h-[calc(100vh-350px)] max-h-[calc(100vh-460px)] overflow-y-scroll",
      )}
      data={data}
      isLoading={false}
      columns={columns}
    />
  );
}
