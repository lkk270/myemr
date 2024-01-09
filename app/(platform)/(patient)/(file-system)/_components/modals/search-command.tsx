"use client";

import { useEffect, useState } from "react";
import { File, FolderPlus, Upload, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
// import { useUser } from "@clerk/clerk-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/use-search";
import { useCurrentUser } from "@/auth/hooks/use-current-user";

export const SearchCommand = () => {
  // const { user } = useUser();
  // const user = useCurrentUser();

  const router = useRouter();
  const documents: any[] = [];
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
    router.push(`/documents/${id}`);
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
    { label: "Back", icon: ChevronLeft, action: onClose },
  ];

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder={`Search records`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          {actionItems.map((item, index) => (
            <CommandItem
              className="text-md text-muted-foreground hover:text-primary "
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
          {documents?.map((document) => (
            <CommandItem
              key={document._id}
              value={`${document._id}-${document.title}`}
              title={document.title}
              onSelect={() => onSelect(document._id)}
            >
              {document.icon ? <p className="mr-2 text-[18px]">{document.icon}</p> : <File className="mr-2 h-4 w-4" />}
              <span>{document.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
