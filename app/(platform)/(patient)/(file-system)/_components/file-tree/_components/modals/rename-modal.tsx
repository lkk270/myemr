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
import { useRenameModal } from "../hooks/use-rename-modal";
import { useFolderStore } from "../../../hooks/use-folders";
import { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import { isValidNodeName } from "@/lib/utils";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const RenameModal = () => {
  const currentUserPermissions = useCurrentUserPermissions();
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading, setIsLoading } = useIsLoading();
  const renameModal = useRenameModal();
  const folderStore = useFolderStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    setIsMounted(true);
    if (renameModal.isOpen && inputRef.current) {
      setName(renameModal.nodeData.name);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 200);
    }
  }, [renameModal.isOpen]);

  if (!isMounted || !renameModal || !renameModal.nodeData) {
    return null;
  }

  const handleSave = () => {
    if (isLoading || !currentUserPermissions.canEdit) return;
    setIsLoading(true);
    const nodeData = renameModal.nodeData;
    const newName = name.trim();
    if (newName === nodeData.name) {
      toast("No changes were made");
      setIsLoading(false);
      renameModal.onClose();
      return;
    }
    if (!isValidNodeName(newName)) {
      toast.error("New name is invalid");
      setIsLoading(false);
      // renameModal.onClose();
      return;
    }
    const promise = axios
      .post("/api/patient-update", {
        nodeId: nodeData.id,
        isFile: nodeData.isFile ? true : false,
        newName: newName,
        updateType: "renameNode",
      })
      .then(({ data }) => {
        folderStore.updateNodeName(nodeData.id, name);
        setIsLoading(false);
        renameModal.onClose();
      })
      .catch((error) => {
        console.log(error?.response?.data);
        // error = error?.response?.data || "Something went wrong";
        // console.log(error);
        throw error;
      })
      .finally(() => {
        setIsLoading(false);
        // renameModal.onClose();
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
    <AlertDialog open={renameModal.isOpen}>
      <AlertDialogContent className="flex flex-col xs:max-w-[400px]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Rename <span className="whitespace-normal break-all italic">{renameModal.nodeData.name}</span>?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-primary pt-2">
            <Input
              ref={inputRef}
              defaultValue={renameModal.nodeData.name}
              onChange={(newName) => {
                setName(newName.target.value);
              }}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={renameModal.onClose} className="w-20 h-8 text-sm">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={() => {
              handleSave();
            }}
            className="w-20 h-8 text-sm"
          >
            Rename
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
