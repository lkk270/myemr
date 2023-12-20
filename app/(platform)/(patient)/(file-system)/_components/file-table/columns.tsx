"use client";

import { ColumnDef } from "@tanstack/react-table";

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
    accessorKey: "modified",
    header: ({ column }) => <DataTableColumnHeader className="justify-end" column={column} title="Modified" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="truncate font-medium">{row.getValue("modified")}</span>
        </div>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => <CustomDataTableRowActions row={row} />,
  },
];
