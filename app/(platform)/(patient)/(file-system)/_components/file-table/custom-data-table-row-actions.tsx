import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

import { DataTableRowActionsProps } from "@/app/types";
import { ActionDropdown } from "../file-tree/_components/action-dropdown";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function CustomDataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const nodeData = row.original;
  return (
    <ActionDropdown
      nodeData={nodeData}
      DropdownTriggerComponent={DropdownMenuTrigger}
      dropdownTriggerProps={{
        asChild: true,
        children: (
          <Button variant="none" className="flex h-4 w-4 p-0 bg-transparent">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Open menu</span>
          </Button>
        ),
      }}
    />
  );
}
