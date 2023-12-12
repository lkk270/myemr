import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableRowActionsProps } from "@/app/types";
import { DeletePopover } from "./delete-popover";

export function DataTableRowActions<TData>({ row, onOpen, onConfirmFunc }: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent hideWhenDetached={true} align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={(e) => {
            // e.preventDefault();
            // e.stopPropagation();
            if (onOpen) {
              onOpen(row.original, true);
            }
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {onConfirmFunc && <DeletePopover onConfirmFunc={onConfirmFunc} />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
