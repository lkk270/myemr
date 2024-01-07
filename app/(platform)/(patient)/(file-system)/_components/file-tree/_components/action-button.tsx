import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState, useRef } from "react";
// import { DataTableRowActionsProps } from "@/app/types";
// import { DeletePopover } from "./delete-popover";

export const ActionButton = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="none" className="flex h-4 w-4 p-0 bg-transparent">
          <DotsHorizontalIcon className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent hideWhenDetached={true} align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={(e) => {
            // e.preventDefault();
            // e.stopPropagation();
            // if (onOpen) {
            //   onOpen(row.original, true);
            // }
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* {onConfirmFunc && <DeletePopover onConfirmFunc={onConfirmFunc} />} */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
