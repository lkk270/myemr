import { CrossCircledIcon, UpdateIcon } from "@radix-ui/react-icons";
import { medicationCategories } from "@/lib/constants";

export const statuses = [
  {
    value: "active",
    label: "Active",
    icon: UpdateIcon,
  },

  {
    value: "inactive",
    label: "Inactive",
    icon: CrossCircledIcon,
  },
];

export const hiddenColumns = { dosageUnits: false, frequency: false };

export const filters = [
  { accessorKey: "status", title: "Status", options: statuses },
  { accessorKey: "category", title: "Category", options: medicationCategories },
];
