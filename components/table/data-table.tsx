"use client";

import { useState, useEffect } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useRouter } from "next/navigation";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { cn, getNodeHref } from "@/lib/utils";
import { SelectedFilesToolbar } from "../../app/(platform)/(patient)/(file-system)/_components/file-table/selected-files-toolbar";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { toast } from "sonner";
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  newOnOpen?: () => void;
  onOpen?: (data: any, isEdit: boolean) => void;
  hiddenColumns?: Record<string, boolean>;
  filters?: { accessorKey: string; title: string; options: { value: string; label: string }[] }[];
  isLoading?: boolean;
  className?: string;
  isLink?: boolean;
  showDataTableViewOptions?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  newOnOpen,
  onOpen,
  hiddenColumns = {},
  filters,
  isLoading = false,
  className = "",
  isLink = false,
  showDataTableViewOptions = true,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const currentUserPermissions = useCurrentUserPermissions();
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(hiddenColumns);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  useEffect(() => {
    table.resetRowSelection(true);
  }, [data]);

  return (
    <>
      <div className="space-y-4">
        <DataTableToolbar
          showDataTableViewOptions={showDataTableViewOptions}
          filters={filters}
          newOnOpen={newOnOpen}
          table={table}
        />
        {isLink && (
          <span style={{ fontSize: "10px" }} className="text-muted-foreground">
            Double click on a row to open it
          </span>
        )}
        <div className={cn("rounded-md border", className)}>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // When rows are undefined, assume data is loading
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length > 0 ? (
                // When there are rows, render them
                table.getRowModel().rows.map((row) => {
                  // Declare rowOriginal here
                  const rowOriginal = row.original as any;

                  // Now return your JSX
                  return (
                    <TableRow
                      className={cn(
                        rowOriginal.restricted
                          ? "opacity-40 cursor-not-allowed hover:bg-transparent"
                          : "cursor-pointer",
                      )}
                      onClick={() => {
                        if (onOpen) {
                          onOpen(row.original, true);
                        }
                      }}
                      onDoubleClick={() => {
                        if (isLink && rowOriginal.restricted) {
                          toast.warning(
                            "You are out of storage, so this file is hidden. Please upgrade your plan to access it.",
                            {
                              duration: 3500,
                            },
                          );
                        } else if (isLink && !rowOriginal.restricted) {
                          router.push(
                            getNodeHref(currentUserPermissions.isPatient, rowOriginal.isFile, rowOriginal.id),
                          );
                        }
                      }}
                      key={row.id}
                      data-state={row.getIsSelected() ? "selected" : undefined}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell className="max-w-[325px]" key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                // When rows are empty, display "No results."
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-xl font-semibold">
                    🫀 Empty 🫀
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="pb-2">{!isLoading && <DataTablePagination table={table} />}</div>
      </div>
      <div className="flex justify-center">
        <SelectedFilesToolbar table={table} />
      </div>
    </>
  );
}
