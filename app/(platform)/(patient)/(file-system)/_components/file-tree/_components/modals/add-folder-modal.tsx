"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAddFolderModal } from "../hooks/use-add-folder-modal";
import { useFolderStore } from "../../../hooks/use-folders";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import { isValidNodeName } from "@/lib/utils";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { useIsLoading } from "@/hooks/use-is-loading";
import { NodeDataType, SingleLayerNodesType2 } from "@/app/types/file-types";
import { GenericCombobox } from "@/components/generic-combobox";
import { cn } from "@/lib/utils";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const AddFolderModal = () => {
  const user = useCurrentUser();
  const currentUserPermissions = useCurrentUserPermissions();
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading, setIsLoading } = useIsLoading();
  const addFolderModal = useAddFolderModal();
  const folderStore = useFolderStore();
  const [name, setName] = useState("");
  const [parentNode, setParentNode] = useState<NodeDataType | SingleLayerNodesType2 | null>(null);

  useEffect(() => {
    if (addFolderModal.nodeData && !addFolderModal.showDropdown) {
      setParentNode(addFolderModal.nodeData);
    }
  }, [addFolderModal.nodeData, addFolderModal.showDropdown]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !addFolderModal || ((!addFolderModal.nodeData || !parentNode) && !addFolderModal.showDropdown)) {
    return null;
  }
  const handleSave = () => {
    if (isLoading || !currentUserPermissions.canAdd) return;
    setIsLoading(true);
    const folderName = name.trim();
    const userId = user?.id;
    const email = user?.email;
    const parentId = parentNode?.id;
    if (!email || !userId || !parentId) {
      toast.error("Something went wrong");
      return;
    }
    if (!isValidNodeName(folderName)) {
      toast.error("New name is invalid");
      setIsLoading(false);
      //   addFolderModal.onClose();
      return;
    }
    const promise = axios
      .post("/api/patient-update", {
        parentId: parentId,
        folderName: folderName,
        addedByUserId: userId,
        patientUserId: userId,
        addedByName: email,
        updateType: "addSubFolder",
      })
      .then(({ data }) => {
        const folder = data.folder;
        folderStore.addSubFolder(
          folder.id,
          folder.name,
          folder.parentId,
          folder.path,
          folder.namePath,
          userId,
          userId,
          email,
        );
        setIsLoading(false);
        addFolderModal.onClose();
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
        // addFolderModal.onClose();
        //no need for set loading to false
        // Toggle edit mode off after operation
      });
    toast.promise(promise, {
      loading: "Saving changes",
      success: "Changes saved successfully",
      error: "Something went wrong",
      duration: 1250,
    });
  };

  const handleFolderChange = (value: string) => {
    const newParentNode = folderStore.singleLayerNodes.find((node) => node.namePath === value);
    if (!!newParentNode) {
      setParentNode(newParentNode);
    }
  };

  return (
    <AlertDialog open={addFolderModal.isOpen}>
      <AlertDialogContent className="flex flex-col xs:max-w-[400px]">
        <AlertDialogHeader>
          {addFolderModal.showDropdown ? (
            <AlertDialogTitle>
              <div>
                {/* <Label htmlFor="height">Height</Label> */}
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
              </div>
            </AlertDialogTitle>
          ) : (
            <AlertDialogTitle>
              Add a folder to <span className="italic whitespace-normal break-all">{parentNode?.name}</span>?
            </AlertDialogTitle>
          )}

          <AlertDialogDescription className="text-primary pt-2">
            <Input
              placeholder="Subfolder Name"
              onChange={(folderName) => {
                setName(folderName.target.value);
              }}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={addFolderModal.onClose} className="w-20 h-8 text-sm">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading || !parentNode?.id || !name}
            onClick={() => {
              handleSave();
            }}
            className="w-20 h-8 text-sm"
          >
            Create
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
