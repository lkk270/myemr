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
              console.log("Hello");
              folderStore.updateNodeName(renameModal.nodeData.id, name);
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
