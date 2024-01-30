"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatFileSize } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { CustomDataTableRowActions } from "./custom-data-table-row-actions";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="truncate font-medium">{row.getValue("name")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    //className="justify-end"
    header: ({ column }) => <DataTableColumnHeader className="justify-end" column={column} title="Type" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2 justify-end pr-[18px]">
          <span className="truncate font-medium">{row.getValue("type")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "size",
    //className="justify-end"
    header: ({ column }) => <DataTableColumnHeader className="justify-end" column={column} title="Size" />,
    cell: ({ row }) => {
      const label = row.getValue("size") ? formatFileSize(row.getValue("size")) : "";
      return (
        <div className="flex space-x-2 justify-end pr-[18px]">
          <span className="truncate font-medium">{label}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    //className="justify-end"
    header: ({ column }) => <DataTableColumnHeader className="justify-end" column={column} title="Uploaded" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2 justify-end pr-[18px]">
          <span className="truncate font-medium">
            {(row.getValue("createdAt") as Date).toISOString().split("T")[0]}
          </span>
        </div>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => <CustomDataTableRowActions row={row} />,
  },
];
