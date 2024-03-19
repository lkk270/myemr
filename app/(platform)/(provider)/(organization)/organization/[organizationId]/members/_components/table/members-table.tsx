"use client";

// import { hiddenColumns, filters } from "./_data/data";
import { columns as baseColumns } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { useOrganizationMembersStore } from "../../hooks/use-members";
import { useEffect } from "react";
import { OrganizationMemberType } from "@/app/types";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { useMediaQuery } from "usehooks-ts";

interface DataTableProps {
  data: OrganizationMemberType[];
}

export function MembersTable({ data }: DataTableProps) {
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const currentUserPermissions = useCurrentUserPermissions();
  const { organizationMembersSet, organizationMembers, setOrganizationMembers } = useOrganizationMembersStore();

  useEffect(() => {
    setOrganizationMembers(data);
    // trunk-ignore(eslint/react-hooks/exhaustive-deps)
  }, [data]);

  let filteredColumns = [...baseColumns];
  if (isMobile) {
    filteredColumns = filteredColumns.filter((column: any) => column.accessorKey !== "createdAt");
  }

  return (
    <DataTable
      showDataTableViewOptions={false}
      // filters={filters}
      // hiddenColumns={hiddenColumns}
      data={organizationMembers}
      isLoading={!organizationMembersSet}
      columns={filteredColumns}
      // className={"xs:max-h-[calc(100vh-350px)] max-h-[calc(100vh-460px)] overflow-y-scroll"}
    />
  );
}
