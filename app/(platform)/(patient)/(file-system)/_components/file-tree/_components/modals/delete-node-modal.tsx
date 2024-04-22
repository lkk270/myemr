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
// import { Button } from "@/components/ui/button";
import { useDeleteModal } from "../hooks/use-delete-node-modal";
import { useState, useEffect } from "react";
import { useFolderStore } from "../../../hooks/use-folders";
import _ from "lodash";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const DeleteModal = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading, setIsLoading } = useIsLoading();
  const currentUserPermissions = useCurrentUserPermissions();
  const foldersStore = useFolderStore();
  const deleteModal = useDeleteModal();
  const router = useRouter();
  const pathname = usePathname();
  const trashNode = foldersStore.singleLayerNodes.find((node) => node.namePath === "/Trash");
  const trashNodeId = trashNode?.id;
  const deleteNodes = deleteModal.nodeDatas;
  const firstDeleteNode = deleteNodes ? deleteNodes[0] : null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !deleteModal || !deleteNodes || !firstDeleteNode || !trashNode) {
    return null;
  }

  const handleSave = async () => {
    let deletedSize = 0n;
    if (isLoading || !currentUserPermissions.canDelete) return;
    const deleteNodesIds = deleteNodes.map((obj) => obj.id);

    setIsLoading(true);
    const promise = axios
      .post("/api/patient-update", {
        selectedIds: deleteNodesIds,
        forEmptyTrash: deleteModal.forEmptyTrash,
        updateType: "deleteNode",
      })
      .then(({ data }) => {
        foldersStore.deleteNode(deleteNodesIds, deleteModal.forEmptyTrash);
        const newlyUnrestrictedFileIds = data.newlyUnrestrictedFileIds;
        foldersStore.updateRestrictedStatus(newlyUnrestrictedFileIds, false);
        const bigIntTotalSize = BigInt(data.totalSize) || 0n;
        deletedSize += bigIntTotalSize;
      })
      .catch((error) => {
        // console.log(error?.response?.data);
        // error = error?.response?.data || "Something went wrong";
        // console.log(error);
        throw error;
      });

    toast.promise(promise, {
      loading: deleteModal.forEmptyTrash
        ? "Emptying trash..."
        : deleteNodesIds.length === 1
        ? "Deleting node..."
        : "Deleting nodes...",
      success: "Node deleted successfully!",
      error: "Something went wrong",
      duration: 1250,
    });
    try {
      await promise; // Wait for the current promise to resolve or reject
      const newSumOfAllSuccessFilesSizes = BigInt(foldersStore.sumOfAllSuccessFilesSizes) - BigInt(deletedSize);
      foldersStore.setSumOfAllSuccessFilesSizes(newSumOfAllSuccessFilesSizes);
      if (!!trashNodeId && !pathname.includes(trashNodeId) && !deleteModal.forEmptyTrash) {
        router.push(`/files/${trashNodeId}`);
      }
    } catch (error) {
      // Error handling if needed
    }

    setIsLoading(false);
    deleteModal.onClose();
  };

  return (
    <AlertDialog open={deleteModal.isOpen}>
      <AlertDialogContent className="flex flex-col xs:max-w-[360px]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {deleteModal.forEmptyTrash ? (
              "Empty trash?"
            ) : (
              <>
                {"Permanently delete "}
                <span className={cn({ "italic whitespace-normal break-all": deleteNodes.length === 1 })}>
                  {deleteNodes.length === 1 ? firstDeleteNode.name : "selected items"}
                </span>
                {"?"}
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {deleteModal.forEmptyTrash
              ? "The contents in trash will be deleted forever. This action cannot be undone."
              : deleteNodes.length === 1
              ? firstDeleteNode.isFile
                ? "This file will be permanently deleted. This action cannot be undone."
                : "This folder and all its children will be permanently deleted. This action cannot be undone."
              : "The selected items and any of their children will be permanently deleted. This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={deleteModal.onClose} className="w-20 h-8 text-sm">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={() => {
              handleSave();
            }}
            className="w-20 h-8 text-sm bg-secondary hover:bg-[#fdf0ef] dark:hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
          >
            {deleteModal.forEmptyTrash ? "Empty" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
