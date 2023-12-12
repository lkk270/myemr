import { Row } from "@tanstack/react-table";

export interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onOpen?: (data: any, isEdit: boolean) => void;
  onConfirmFunc?: () => void;
}
