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

export const AddFolderModal = () => {
  const user = useCurrentUser();
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading, setIsLoading } = useIsLoading();
  const addFolderModal = useAddFolderModal();
  const folderStore = useFolderStore();
  const [name, setName] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !addFolderModal || !addFolderModal.nodeData) {
    return null;
  }

  const handleSave = () => {
    setIsLoading(true);
    const nodeData = addFolderModal.nodeData;
    const folderName = name.trim();
    const userId = user?.id;
    const email = user?.email;
    const parentId = nodeData.id;
    if (!email || !userId) {
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
        console.log(data);
        const folder = data.folder;
        console.log(folder);
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

  return (
    <AlertDialog open={addFolderModal.isOpen}>
      <AlertDialogContent className="flex flex-col xs:max-w-[400px]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Add a folder to <span className="italic whitespace-normal break-all">{addFolderModal.nodeData.name}</span>?
          </AlertDialogTitle>
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
            disabled={isLoading}
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
