import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, FolderInput, FileInput, Download, Trash, FolderPlus } from "lucide-react";

import { cn, getFileIcon } from "@/lib/utils";
import { FaFolder } from "react-icons/fa";
import { MenuHeader } from "./menu-header";
import { useMenuItems } from "./hooks";

interface ActionDropdownProps {
  nodeData: any; // Define the type for nodeData
  iconClassName?: string;
  DropdownTriggerComponent: React.FC<any>; // Component type
  dropdownTriggerProps?: any;
  showMenuHeader?: boolean;
}

export const ActionDropdown = ({
  nodeData,
  iconClassName = "w-4 h-4 mr-2",
  DropdownTriggerComponent,
  dropdownTriggerProps,
  showMenuHeader = true,
}: ActionDropdownProps) => {
  const CustomIcon = nodeData.isFile ? getFileIcon(nodeData.name, nodeData.type) : FaFolder;
  const menuItems = useMenuItems(nodeData);
  if (menuItems.length === 0) return null;
  return (
    <DropdownMenu>
      {/* <DropdownMenuTrigger asChild>
        <Button variant="none" className="flex h-4 w-4 p-0 bg-transparent">
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger> */}
      <DropdownTriggerComponent {...dropdownTriggerProps} />
      <DropdownMenuContent hideWhenDetached={true} align="end" className="w-[160px] flex flex-col">
        {showMenuHeader && <MenuHeader title={nodeData.name} icon={CustomIcon} />}
        {menuItems.map((item, index) => {
          // If the condition is not met, render the DropdownMenuItem as usual
          return (
            <DropdownMenuItem
              key={index}
              className={cn(item.differentClassName ? item.differentClassName : "font-normal text-primary/90")}
              onClick={() => {
                item.action();
              }}
            >
              <item.icon className={iconClassName} />

              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
