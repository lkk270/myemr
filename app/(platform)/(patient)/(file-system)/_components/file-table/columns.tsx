"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatFileSize } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { CustomDataTableRowActions } from "./custom-data-table-row-actions";
import { getFileIcon } from "@/lib/utils";
import { FaFolder } from "react-icons/fa";
import { Checkbox } from "@/components/ui/checkbox";

export const columns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        // onClick={(e) => e.preventDefault()}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const name = row.original.name;
      const type = row.original.type;
      const CustomIcon = row.original.isFile ? getFileIcon(name, type) : FaFolder;
      return (
        <div className="flex items-center space-x-2">
          <CustomIcon size={"20px"} />
          <span className="truncate font-medium">{name}</span>
        </div>
      );
    },
  },
  // {
  //   accessorKey: "type",
  //   //className="justify-end"
  //   header: ({ column }) => <DataTableColumnHeader className="justify-end" column={column} title="Type" />,
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex space-x-2 justify-end pr-[18px]">
  //         <span className="truncate font-medium">{row.getValue("type")}</span>
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "size",
    //className="justify-end"
    header: ({ column }) => <DataTableColumnHeader className="justify-end" column={column} title="Size" />,
    cell: ({ row }) => {
      const size = row.original.size;
      const label = size ? formatFileSize(size) : "";
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
          <span className="truncate font-medium">{(row.original.createdAt as Date).toISOString().split("T")[0]}</span>
        </div>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => <CustomDataTableRowActions row={row} />,
  },
];
