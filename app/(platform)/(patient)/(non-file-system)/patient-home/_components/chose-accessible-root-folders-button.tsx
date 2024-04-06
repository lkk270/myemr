"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useIsLoading } from "@/hooks/use-is-loading";
import { Save } from "lucide-react";
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
import { changeOrganizationAccessibleRootFolders } from "../../providers/actions/organizations";

type RootFolderType = {
  checked: boolean;
  id: string;
  name: string;
};

interface ChooseAccessibleRootFoldersButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
  initialDefaultRootFolders: string;
  patientMemberId?: string | null;
  initialCsrfButtonLabel: string;
  handleAccessibleRootFoldersChange: (value: string) => void;
}

export const ChooseAccessibleRootFoldersButton = ({
  children,
  asChild,
  initialDefaultRootFolders,
  initialCsrfButtonLabel,
  patientMemberId = null,
  handleAccessibleRootFoldersChange,
}: ChooseAccessibleRootFoldersButtonProps) => {
  const [crfButtonLabel, setCrfButtonLabel] = useState(initialCsrfButtonLabel);
  const [idsString, setIdsString] = useState(initialDefaultRootFolders);
  const { isLoading } = useIsLoading();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemsSet, setItemsSet] = useState(false);
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
    if (dropdownOpen) {
      if (checkedItems.length === 0) {
        handleSelectChange(items[0]);
        setIdsString(items[0].id);
        // if (!patientMemberId) {
        //   handleAccessibleRootFoldersChange(items[0].id);
        // }
      } else if (checkedItems.length === items.length) {
        setIdsString("ALL_EXTERNAL");
        // if (!patientMemberId) {
        //   handleAccessibleRootFoldersChange("ALL_EXTERNAL");
        // }
      } else {
        const idsStringTemp = checkedItems.map((item) => item.id).join(",");
        setIdsString(idsStringTemp);
        // if (!patientMemberId) {
        //   console.log("IN HEE");
        //   handleAccessibleRootFoldersChange(idsString);
        // }
      }
    }
  }, [items, dropdownOpen, patientMemberId]);

  useEffect(() => {
    const numOfRootFolders = idsString.split(",").length;
    const foldersText = numOfRootFolders === 1 ? "Folder" : "Folders";
    const crfButtonLabelTemp =
      idsString === "ALL_EXTERNAL" ? "All Root Folders" : `${numOfRootFolders.toString()} Root ${foldersText}`;

    setCrfButtonLabel(crfButtonLabelTemp);
  }, [idsString, dialogOpen]);

  const openDialog = () => {
    setItemsSet(false);
    setDialogOpen(true);
    const defaultRootFolderIdsArray = initialDefaultRootFolders.split(",");
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
              checked: initialDefaultRootFolders === "ALL_EXTERNAL" ? true : defaultRootFolderIdsArray.includes(obj.id),
              id: obj.id,
              name: obj.name,
            }));
            setItems(items);
            setItemsSet(true);
            if (items.length > 0) {
              setDropdownOpen(true);
            }
          }
        })
        .catch((error) => {
          setItems([]);
          setItemsSet(true);
          toast.error("something went wrong");
        });
    });
  };

  const onSave = () => {
    if (!patientMemberId) return;
    startTransition(() => {
      changeOrganizationAccessibleRootFolders(patientMemberId, idsString)
        .then((data) => {
          if (!data || !!data.error) {
            toast.error("something went wrong");
            return;
          } else if (!!data.success) {
            toast.success(data.success);
            handleAccessibleRootFoldersChange(idsString);
            setDialogOpen(false);
          }
        })
        .catch((error) => {
          toast.error("something went wrong");
        });
    });
  };

  const onSelect = () => {
    handleAccessibleRootFoldersChange(idsString);
    setDialogOpen(false);
  };

  return (
    <Dialog
      onOpenChange={() => {
        setDialogOpen(!dialogOpen);
      }}
      open={dialogOpen}
    >
      <DialogTrigger onClick={openDialog} asChild={asChild}>
        {children}
      </DialogTrigger>
      <DialogContent
        onPointerDownOutside={() => {
          setDialogOpen(false);
        }}
        className="flex flex-col items-center p-0 justify-center rounded-lg h-[100px] pt-4 xxs:pt-0"
      >
        {!itemsSet ? (
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
          <div className="flex flex-row gap-x-2">
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
            {idsString !== initialDefaultRootFolders && (
              <Button
                onClick={!!patientMemberId ? onSave : onSelect}
                disabled={isPending}
                variant="secondary"
                className="w-20 h-10 flex flex-row gap-x-2"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span className="text-sm">{!!patientMemberId ? "Save" : "Select"}</span>
              </Button>
            )}
          </div>
        )}
        {!isPending && items.length === 0 && <p className="text-xs text-red-500">You have no root folders</p>}
      </DialogContent>
    </Dialog>
  );
};
