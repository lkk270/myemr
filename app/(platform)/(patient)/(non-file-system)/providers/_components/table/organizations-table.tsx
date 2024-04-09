"use client";

// import { hiddenColumns, filters } from "./_data/data";
import { columns as baseColumns } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { useOrganizationsStore } from "../../hooks/use-organizations";
import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import { PatientMember } from "@prisma/client";
import { cn } from "@/lib/utils";

interface DataTableProps {
  data: PatientMember[];
}

export function OrganizationsTable({ data }: DataTableProps) {
  const isMobile = useMediaQuery("(max-width: 735px)");
  const { organizationsSet, organizations, setOrganizations } = useOrganizationsStore();

  useEffect(() => {
    setOrganizations(data);
    // trunk-ignore(eslint/react-hooks/exhaustive-deps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  let filteredColumns = [...baseColumns];
  if (isMobile) {
    filteredColumns = filteredColumns.filter((column: any) => column.accessorKey !== "createdAt");
  }
  const targetLength = 10;

  // Using a while loop to fill the array
  while (data.length < targetLength) {
    // Make a copy of the object. This is a shallow copy.
    let newObj = { ...data[0] };

    // For a deep copy, if your object has nested objects, use:
    // let newObj = JSON.parse(JSON.stringify(myArray[0]));

    // Push the copy into the array
    data.push(newObj);
  }
  return (
    <DataTable
      showDataTableViewOptions={false}
      // filters={filters}
      // hiddenColumns={hiddenColumns}
      doubleClickLink={{ firstPart: "providers", idName: "id", lastPart: "" }}
      data={data}
      isLoading={!organizationsSet}
      columns={filteredColumns}
      className={cn(
        data.length <= 6
          ? `min-h-[${53 * data.length}px]`
          : "min-h-[300px]" && "xs:max-h-[calc(100vh-310px)] max-h-[calc(100vh-390px)] overflow-y-scroll",
      )}
      // className={"xs:max-h-[calc(100vh-350px)] max-h-[calc(100vh-460px)] overflow-y-scroll"}
    />
  );
}
