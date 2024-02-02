"use client";

import { useEffect, useState } from "react";
import { File, FolderPlus, Upload, ChevronLeft } from "lucide-react";
import axios from "axios";

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
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { toast } from "sonner";
import { useIsLoading } from "@/hooks/use-is-loading";

interface CommandItemComponentProps {
  obj: { label: string; value: string };
  index: number;
  alreadyUsed: boolean;
  isInTrash: boolean;
}
export const NewRootFolder = () => {
  const user = useCurrentUser();
  const foldersStore = useFolderStore();
  const singleLayerNodes = foldersStore.singleLayerNodes;
  const alreadyUsedRootNames = singleLayerNodes
    .filter((item) => item.isRoot && item.namePath !== "/Trash")
    .map((item) => item.name);
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading, setIsLoading } = useIsLoading();

  const isOpen = useNewRootFolder((store) => store.isOpen);
  const onClose = useNewRootFolder((store) => store.onClose);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onSelect = (label: string) => {
    if (isLoading) return;
    setIsLoading(true);
    const userId = user?.id;
    const email = user?.email;
    if (!email || !userId) {
      toast.error("Something went wrong");
      return;
    }
    if (user && user.email) {
      const promise = axios
        .post("/api/patient-update", {
          folderName: label,
          addedByUserId: userId,
          patientUserId: userId,
          addedByName: email,
          updateType: "addRootNode",
        })
        .then(({ data }) => {
          foldersStore.addRootNode(label, data.folderId, userId, email);
          setIsLoading(false);
          onClose();
        })
        .catch((error) => {
          error = error?.response?.data;
          if (error && error !== "Internal Error") {
            toast.error(error);
          }
          throw error;
        })
        .finally(() => {
          setIsLoading(false);
        });
      toast.promise(promise, {
        loading: "Adding root node...",
        success: "Changes saved successfully",
        error: "Something went wrong",
        duration: 1250,
      });
    }
  };

  if (!isMounted) {
    return null;
  }

  const CommandItemComponent = ({ obj, index, alreadyUsed, isInTrash }: CommandItemComponentProps) => {
    const commonProps = {
      key: index,
      value: obj.label,
      title: obj.label,
    };

    if (alreadyUsed) {
      return (
        <CommandItem
          key={commonProps.key}
          value={commonProps.value}
          title={commonProps.title}
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
              {isInTrash ? "Already exists (in trash)" : "Already exists"}
            </Badge>
          </div>
        </CommandItem>
      );
    } else {
      return (
        <CommandItem
          key={commonProps.key}
          value={commonProps.value}
          title={commonProps.title}
          onSelect={() => onSelect(obj.label)}
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
            <CommandItemComponent
              key={index}
              obj={obj}
              index={index}
              alreadyUsed={alreadyUsedRootNames.includes(obj.label)}
              isInTrash={singleLayerNodes.some((node) => node.name === obj.label && node.namePath.startsWith("/Trash"))}
            />
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
