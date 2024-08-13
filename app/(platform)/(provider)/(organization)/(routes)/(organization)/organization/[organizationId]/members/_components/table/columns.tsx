"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { PermissionsDropdown } from "./permissions-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaUser } from "react-icons/fa";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "user.name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2 items-center">
          <Avatar className="w-8 h-8">
            <AvatarImage style={{ objectFit: "cover" }} draggable={false} src={row.original.user.image || ""} />
            <AvatarFallback className="bg-sky-500">
              <FaUser className="text-white" />
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[20vw] truncate font-medium">{row.original.user.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "user.email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[20vw] truncate font-medium">{row.original.user.email}</span>
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
    id: "permissions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => <PermissionsDropdown memberId={row.original.id as string} />,
  },
];
