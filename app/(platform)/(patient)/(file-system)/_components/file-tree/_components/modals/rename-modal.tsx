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

export const RenameModal = () => {
  const [isMounted, setIsMounted] = useState(false);
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
    const nodeData = renameModal.nodeData;
    const newName = name.trim();
    if (newName === nodeData.name) {
      toast("No changes were made");
      return;
    }
    if (!isValidNodeName(newName)) {
      toast.error("New name is invalid");
      return;
    }
    const promise = axios
      .post("/api/patient-update", {
        nodeId: nodeData.id,
        isFile: nodeData.isFile,
        newName: newName,
        updateType: "renameNode",
      })
      .then(({ data }) => {
        folderStore.updateNodeName(renameModal.nodeData.id, name);
      })
      .catch((error) => {
        console.log(error?.response?.data);
        error = error?.response?.data || "Something went wrong";
        console.log(error);
        throw error;
      })
      .finally(() => {
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
    <AlertDialog open={renameModal.isOpen} onOpenChange={renameModal.onClose}>
      <AlertDialogContent className="flex flex-col xs:max-w-[400px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="whitespace-normal break-all">
            Rename <span className="italic">{renameModal.nodeData.name}</span>?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-primary">
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
          <AlertDialogCancel className="w-20 h-8 text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
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
