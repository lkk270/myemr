"use client";

import { useEffect, useState } from "react";
import { File, Folder, FolderPlus, Upload, ChevronLeft } from "lucide-react";
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
import { useSearch } from "../hooks/use-search";
import Link from "next/link";
import { getFileIcon } from "@/lib/utils";
export const SearchCommand = () => {
  const foldersStore = useFolderStore();
  const singleLayerNodes = foldersStore.singleLayerNodes;
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const toggle = useSearch((store) => store.toggle);
  const isOpen = useSearch((store) => store.isOpen);
  const onClose = useSearch((store) => store.onClose);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  const onSelect = (id: string) => {
    router.push(`/files/${id}`);
    onClose();
  };

  if (!isMounted) {
    return null;
  }

  const actionItems = [
    {
      label: "Create a new Folder",
      icon: FolderPlus,
      action: () => onClose(),
    },
    { label: "Upload records", icon: Upload, action: onClose },
    // { label: "Back", icon: ChevronLeft, action: onClose },
  ];

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder={`Search records`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          {actionItems.map((item, index) => (
            <CommandItem
              className="text-md text-primary/70 hover:text-primary "
              key={index}
              title={item.label}
              onSelect={() => item.action()}
            >
              <div className="flex gap-x-4 items-center justify-center">
                <div className="bg-primary/10 rounded-md p-2">
                  <item.icon className="flex w-6 h-6" />
                </div>
                {item.label}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Recent Records">
          {singleLayerNodes.length === 0 && <div className="text-primary/70 ml-2 text-sm">No records :(</div>}
          {singleLayerNodes?.map((node, index) => (
            <Link key={index} href={`/files/${node.id}`} onClick={onClose}>
              <CommandItem key={node.id} value={`${node.name}`} title={node.name} className="text-primary/70">
                {(() => {
                  const CustomIcon = node.isFile ? getFileIcon(node.name) : Folder;
                  return <CustomIcon className="mr-2 h-4 w-4" />;
                })()}
                <div className="flex flex-col">
                  <span className="break-all whitespace-normal">{node.name}</span>
                  <span
                    style={{ fontSize: "10px", lineHeight: "13.3px" }}
                    className="text-primary/40 break-all whitespace-normal"
                  >
                    {node.namePath}
                  </span>
                </div>
              </CommandItem>
            </Link>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
