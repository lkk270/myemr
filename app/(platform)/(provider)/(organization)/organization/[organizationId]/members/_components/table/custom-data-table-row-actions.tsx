import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableRowActionsProps, MedicationType } from "@/app/types";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export function CustomDataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const currentUserPermissions = useCurrentUserPermissions();

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
        // onClick={(e) => {
        //   console.log("IN 30");
        //   console.log(!!viewMedicationModal.onOpen);
        //   // e.preventDefault();
        //   // e.stopPropagation();
        //   if (!!viewMedicationModal.onOpen) {
        //     viewMedicationModal.onOpen(row.original as MedicationType, true);
        //   }
        // }}
        >
          {currentUserPermissions.canEdit ? "Edit" : "View"}
        </DropdownMenuItem>
        {currentUserPermissions.canDelete && (
          <DropdownMenuItem
          // onClick={(e) => {
          //   // e.preventDefault();
          //   e.stopPropagation();
          //   if (deleteMedicationModal.onOpen) {
          //     deleteMedicationModal.onOpen(row.original as MedicationType);
          //   }
          // }}
          >
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
