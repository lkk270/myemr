"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GenericCombobox } from "@/components/generic-combobox";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useFolderStore } from "../../../(file-system)/_components/hooks/use-folders";
import { addLastViewedAtAndSort, cn, extractNodes, sortFolderChildren, sortRootNodes } from "@/lib/utils";
import { FolderNameType, NodeDataType, SingleLayerNodesType2 } from "@/app/types/file-types";
import { useEffect, useState, useTransition } from "react";
import { fetchAllFoldersForPatient } from "@/lib/actions/files";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";

interface ChooseFolderButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
  unMount?: boolean;
  handleChange: (value: any, folder: FolderNameType) => void;
}

export const ChooseFolderButton = ({ children, asChild, handleChange, unMount = false }: ChooseFolderButtonProps) => {
  const currentUser = useCurrentUser();
  const { isLoading } = useIsLoading();
  const folderStore = useFolderStore();
  const [isPending, startTransition] = useTransition();
  const [parentNode, setParentNode] = useState<NodeDataType | SingleLayerNodesType2 | null>(null);
  const [itemsSet, setItemsSet] = useState(false);
  const [items, setItems] = useState<{ label: string; value: string; namePath: string }[] | null>(null);

  const handleFolderChange = (value: string) => {
    const newParentNode = folderStore.singleLayerNodes.find((node) => node.namePath === value);
    if (!!newParentNode) {
      setParentNode(newParentNode);
      handleChange(newParentNode?.id, { name: newParentNode?.name, namePath: newParentNode.namePath });
    }
  };
  useEffect(() => {}, [folderStore.singleLayerNodes]);

  useEffect(() => {
    if (unMount) {
      setParentNode(null);
    }
  }, [unMount]);

  const openDialog = () => {
    if (!currentUser || !currentUser.id) {
      return;
    }
    startTransition(() => {
      fetchAllFoldersForPatient(null, currentUser.id!, null, null)
        .then((data) => {
          if (!data || data === "Unauthorized") {
            toast.error("something went wrong");
            return;
          } else {
            const sortedFoldersTemp = data.map((folder) => sortFolderChildren(folder));
            const sortedFolders = sortRootNodes(sortedFoldersTemp);
            let rawAllNodes = extractNodes(data);
            const allNodesMap = new Map(rawAllNodes.map((node) => [node.id, { ...node, children: undefined }]));
            const allNodesArray = Array.from(allNodesMap.values());
            const singleLayerNodes = addLastViewedAtAndSort(allNodesArray);
            folderStore.setFolders(sortedFolders);
            folderStore.setSingleLayerNodes(singleLayerNodes);
            const folderItems = folderStore.getDropdownFolders();
            setItems(folderItems);
            setItemsSet(true);
          }
        })
        .catch((error) => {
          setItems([]);
          setItemsSet(true);
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
        {!itemsSet || !items ? (
          <BeatLoader color="#4b59f0" />
        ) : (
          <GenericCombobox
            valueParam={parentNode?.namePath}
            handleChange={(value) => handleFolderChange(value)}
            disabled={isLoading}
            forFileSystem={true}
            className={cn("xs:min-w-[350px] xs:max-w-[350px]")}
            placeholder="Select parent folder"
            searchPlaceholder="Search..."
            noItemsMessage="No results"
            items={items}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
