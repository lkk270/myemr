"use client";

import { useEffect, useState } from "react";
import { File, FolderPlus, Upload, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFolderStore } from "../hooks/use-folders";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useNewRootFolder } from "../hooks/use-new-root-folder";
import { rootFolderCategories } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface CommandItemComponentProps {
  obj: { label: string; value: string };
  index: number;
  alreadyUsed: boolean;
}
export const NewRootFolder = () => {
  const foldersStore = useFolderStore();
  const singleLayerNodes = foldersStore.singleLayerNodes;
  const alreadyUsedRootNames = singleLayerNodes.filter((item) => item.isRoot).map((item) => item.name);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const isOpen = useNewRootFolder((store) => store.isOpen);
  const onClose = useNewRootFolder((store) => store.onClose);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onSelect = (id: string) => {
    router.push(`/files/${id}`);
    onClose();
  };

  if (!isMounted) {
    return null;
  }

  const CommandItemComponent = ({ obj, index, alreadyUsed }: CommandItemComponentProps) => {
    const commonProps = {
      key: index,
      value: obj.label,
      title: obj.label,
    };

    if (alreadyUsed) {
      return (
        <CommandItem
          {...commonProps}
          className="text-md text-primary/20 cursor-not-allowed aria-selected:bg-secondary aria-selected:text-primary/20"
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-x-4 items-center">
              <div className="bg-primary/10 rounded-md p-2">
                <FolderPlus className="w-6 h-6" />
              </div>
              {obj.label}
            </div>
            <Badge className="border-primary/10 border-[1px] flex justify-end text-primary/30" variant="outline">
              Already exists
            </Badge>
          </div>
        </CommandItem>
      );
    } else {
      return (
        <CommandItem
          {...commonProps}
          // onSelect={() => onSelect(node.id)}
          className="text-md text-primary/70 hover:text-primary"
        >
          <div className="flex gap-x-4 items-center justify-center">
            <div className="bg-primary/10 rounded-md p-2">
              <FolderPlus className="flex w-6 h-6" />
            </div>
            {obj.label}
          </div>
        </CommandItem>
      );
    }
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder={`Search categories`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Root Categories">
          {rootFolderCategories?.map((obj, index) => (
            <CommandItemComponent obj={obj} index={index} alreadyUsed={alreadyUsedRootNames.includes(obj.label)} />
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
