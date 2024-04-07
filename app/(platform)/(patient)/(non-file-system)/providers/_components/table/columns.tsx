"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { PermissionsDropdown } from "./permissions-dropdown";
import { AboutAccessibleRootFoldersPopover } from "../../../patient-home/_components/about-accessible-root-folders-popover";
import { OrganizationAvatar } from "@/app/(platform)/(provider)/(organization)/_components/organization-avatar";
import { ChooseAccessibleRootFoldersButtonWrapper } from "./choose-accessible-root-folders-button-wrapper";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      return (
        //min-w-[20vw] lg:min-w-[40vw]
        <div className="flex space-x-2 items-center ">
          <div className="flex flex-col items-center justify-center w-[38px] h-[38px] border-2 border-primary/20 rounded-sm shrink-0">
            <OrganizationAvatar
              buildingParentDivPadding="p-[4px]"
              imageClassName="max-h-[32px] max-w-[32px] w-auto"
              buildingClassName="h-[24px] w-[24px]"
              profileImageUrl={row.original.organizationProfileImageUrl}
              imageSize={30}
            />
          </div>
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
    header: ({ column }) => {
      return (
        <div className="flex flex-row gap-x-2">
          <DataTableColumnHeader column={column} title="Accessible Root Folders" />
          <div className="hidden lg:flex">
            <AboutAccessibleRootFoldersPopover showHeader={false} />
          </div>
        </div>
      );
    },
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
