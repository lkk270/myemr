"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { PermissionsDropdown } from "./permissions-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaUser } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ChooseAccessibleRootFoldersButtonWrapper } from "./choose-accessible-root-folders-button-wrapper";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      return (
        //min-w-[20vw] lg:min-w-[40vw]
        <div className="flex space-x-2 items-center ">
          <Avatar className="w-8 h-8">
            <AvatarImage draggable={false} src={row.original.organizationProfileImageUrl || ""} />
            <AvatarFallback className="bg-sky-500">
              <FaUser className="text-white" />
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[20vw] truncate font-medium">{row.original.organizationName}</span>
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
  // {
  //   accessorKey: "createdAt",
  //   header: ({ column }) => <DataTableColumnHeader column={column} title="Added" />,
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex space-x-2">
  //         <span className="max-w-[20vw] truncate font-medium">
  //           {row.original.createdAt.toISOString().split("T")[0]}
  //         </span>
  //       </div>
  //     );
  //   },
  // },

  {
    id: "accessibleRootFolders",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Accessible Root Folders" />,
    cell: ({ row }) => {
      // console.log(row);
      return <ChooseAccessibleRootFoldersButtonWrapper patientMemberId={row.original.id} />;
    },
  },
  {
    id: "permissions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => <PermissionsDropdown memberId={row.original.id as string} />,
  },
];
