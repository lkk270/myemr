"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";

import { statuses } from "./_data/data";
import { fieldCategories } from "@/lib/constants";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { CustomDataTableRowActions } from "./custom-data-table-row-actions";
import { medicationsList } from "@/lib/constants";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {medicationsList.find((item) => item.value === row.getValue("name"))?.label || row.getValue("name")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => {
      const category = fieldCategories.find((category) => category.value === row.getValue("category"));

      if (!category) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          <Badge variant="outline">{category.label}</Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = statuses.find((status) => status.value === row.getValue("status"));

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "prescribedByName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Prescribing Physician" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("prescribedByName")}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "dosageUnits",
    header: ({ column }) => <DataTableColumnHeader column={column} title="dosageUnits" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("dosageUnits")}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "frequency",
    header: ({ column }) => <DataTableColumnHeader column={column} title="frequency" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("frequency")}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  {
    accessorKey: "dosage",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Dosage" />,
    cell: ({ row }) => {
      const value = `${row.getValue("dosage") as string} ${row.getValue("dosageUnits") as string}/${
        row.getValue("frequency") as string
      } `;
      return (
        <div className="flex items-center">
          <span>{value}</span>
        </div>
      );
    },

    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CustomDataTableRowActions row={row} />,
  },
];
