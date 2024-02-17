"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GenericCombobox } from "@/components/generic-combobox";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useFolderStore } from "../../../(file-system)/_components/hooks/use-folders";
import { cn } from "@/lib/utils";
import { NodeDataType, SingleLayerNodesType2 } from "@/app/types/file-types";
import { useState } from "react";

interface ChooseFolderButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const ChooseFolderButton = ({ children, asChild }: ChooseFolderButtonProps) => {
  const { isLoading } = useIsLoading();
  const folderStore = useFolderStore();
  const [parentNode, setParentNode] = useState<NodeDataType | SingleLayerNodesType2 | null>(null);

  const handleFolderChange = (value: string) => {
    const newParentNode = folderStore.singleLayerNodes.find((node) => node.namePath === value);
    if (!!newParentNode) {
      setParentNode(newParentNode);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent className="flex flex-col items-center p-0 bg-transparent border-none rounded-lg">
        <GenericCombobox
          valueParam={parentNode?.namePath}
          handleChange={(value) => handleFolderChange(value)}
          disabled={isLoading}
          forFileSystem={true}
          className={cn("xs:min-w-[350px] xs:max-w-[350px]")}
          placeholder="Select parent folder"
          searchPlaceholder="Search..."
          noItemsMessage="No results"
          items={folderStore.getDropdownFolders()}
        />
      </DialogContent>
    </Dialog>
  );
};
