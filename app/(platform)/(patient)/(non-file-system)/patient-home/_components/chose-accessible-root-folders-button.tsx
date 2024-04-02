"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GenericCombobox } from "@/components/generic-combobox";
import { useIsLoading } from "@/hooks/use-is-loading";
import { cn } from "@/lib/utils";
import { FolderNameType } from "@/app/types/file-types";
import { useEffect, useState, useTransition } from "react";
import { fetchAllRootFolders } from "@/lib/actions/files";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";

import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Checked = DropdownMenuCheckboxItemProps["checked"];

type RootFolderType = {
  checked: boolean;
  id: string;
  name: string;
};

interface ChooseAccessibleRootFolderButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
  crfButtonLabel: string;
  defaultRootFolderIds: string;
  handleAccessibleRootFoldersChange: (value: string) => void;
}

export const ChooseAccessibleRootFolderButton = ({
  children,
  asChild,
  crfButtonLabel,
  defaultRootFolderIds,
  handleAccessibleRootFoldersChange,
}: ChooseAccessibleRootFolderButtonProps) => {
  const { isLoading } = useIsLoading();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<RootFolderType[]>([]);

  const handleSelectChange = (value: RootFolderType) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === value.id ? { ...item, checked: !item.checked } : item)),
    );
  };

  const handleOutsideFocus = (event: any) => {
    setDropdownOpen(false);
  };

  useEffect(() => {
    const checkedItems = items.filter((item) => item.checked);
    if (checkedItems.length === 0 && dropdownOpen) {
      handleSelectChange(items[0]);
      handleAccessibleRootFoldersChange(items[0].id);
    } else if (checkedItems.length === items.length) {
      handleAccessibleRootFoldersChange("ALL_EXTERNAL");
    } else {
      const idsString = checkedItems.map((item) => item.id).join(",");
      handleAccessibleRootFoldersChange(idsString);
    }
  }, [items]);

  const openDialog = () => {
    const defaultRootFolderIdsArray = defaultRootFolderIds.split(",");
    startTransition(() => {
      fetchAllRootFolders()
        .then((data) => {
          if (!data || !!data.error) {
            toast.error("something went wrong");
            return;
          } else if (!!data.rootFolders) {
            const folders = data.rootFolders.sort((a, b) => {
              return a.name.localeCompare(b.name);
            });
            const items = folders.map((obj) => ({
              checked: defaultRootFolderIds === "ALL_EXTERNAL" ? true : defaultRootFolderIdsArray.includes(obj.id),
              id: obj.id,
              name: obj.name,
            }));
            setItems(items);
            if (items.length > 0) {
              setDropdownOpen(true);
            }
          }
        })
        .catch((error) => {
          toast.error("something went wrong");
        });
    });
  };
  return (
    <Dialog>
      <DialogTrigger onClick={openDialog} asChild={asChild}>
        {children}
      </DialogTrigger>
      <DialogContent className="flex flex-col items-center p-0 justify-center rounded-lg h-[100px]">
        {isPending || !items ? (
          <BeatLoader color="#4b59f0" />
        ) : (
          // <GenericCombobox
          //   valueParam={parentNode?.namePath}
          //   handleChange={(value) => handleFolderChange(value)}
          //   disabled={isLoading}
          //   forFileSystem={true}
          //   className={cn("xs:min-w-[350px] xs:max-w-[350px]")}
          //   placeholder="Select root folders"
          //   searchPlaceholder="Search..."
          //   noItemsMessage="No results"
          //   items={items}
          // />
          <DropdownMenu open={dropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={isLoading || items.length === 0}
                onClick={() => setDropdownOpen(true)}
                variant="outline"
              >
                {crfButtonLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" onPointerDownOutside={handleOutsideFocus}>
              <DropdownMenuLabel>Root Folders</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {items.map((item, index) => (
                <DropdownMenuCheckboxItem
                  key={index}
                  defaultChecked={true}
                  checked={item.checked}
                  onCheckedChange={() => handleSelectChange(item)}
                >
                  {item.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {!isPending && items.length === 0 && <p className="text-xs text-red-500">You have no root folders</p>}
      </DialogContent>
    </Dialog>
  );
};
