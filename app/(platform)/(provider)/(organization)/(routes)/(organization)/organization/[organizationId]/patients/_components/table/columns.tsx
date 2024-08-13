"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaUser } from "react-icons/fa";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "patientProfile.name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2 items-center">
          <Avatar className="w-8 h-8">
            <AvatarImage
              style={{ objectFit: "cover" }}
              draggable={false}
              src={row.original.patientProfile.imageUrl || ""}
            />
            <AvatarFallback className="bg-sky-500">
              <FaUser className="text-white" />
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[20vw] truncate font-medium">{row.original.patientProfile.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "patientProfile.dateOfBirth",
    header: ({ column }) => <DataTableColumnHeader column={column} title="DOB" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[20vw] truncate font-medium">{row.original.patientProfile.dateOfBirth}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Added" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[20vw] truncate font-medium">
            {row.original.createdAt.toISOString().split("T")[0]}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Access Type" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[20vw] truncate font-medium">{row.original.role}</span>
        </div>
      );
    },
  },
  //   {
  //     id: "actions",
  //     cell: ({ row }) => <CustomDataTableRowActions row={row} />,
  //   },
];
