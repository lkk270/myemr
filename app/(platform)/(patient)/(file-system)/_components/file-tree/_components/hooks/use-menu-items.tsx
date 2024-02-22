import { Pencil, Upload, FileInput, FolderInput, Undo2, Download, Trash, FolderPlus } from "lucide-react";
import { MenuItemData, NodeDataType } from "@/app/types/file-types";
import { useIsLoading } from "@/hooks/use-is-loading";
import axios from "axios";
import { toast } from "sonner";
import { useFolderStore } from "../../../hooks/use-folders";
import {
  useTrashModal,
  useDownloadModal,
  useRenameModal,
  useAddFolderModal,
  useMoveModal,
  useUploadFilesModal,
  useDeleteModal,
} from ".";

import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const useMenuItems = (nodeData: any) => {
  const trashModal = useTrashModal();
  const deleteModal = useDeleteModal();
  const downloadModal = useDownloadModal();
  const renameModal = useRenameModal();
  const moveModal = useMoveModal();
  const addFolderModal = useAddFolderModal();
  const uploadFilesModal = useUploadFilesModal();
  const foldersStore = useFolderStore();

  const currentUserPermissions = useCurrentUserPermissions();
  const { isLoading } = useIsLoading();

  const inTrash = nodeData.namePath.startsWith("/Trash");
  const isTrashNode = nodeData.namePath === "/Trash";
  const isRestricted = nodeData.restricted;
  // const trashHasContents = isTrashNode
  //   ? foldersStore.singleLayerNodes.some((node) => node.namePath.startsWith("/Trash") && !node.isRoot)
  //   : undefined;
  // const trashNodeImmediateChildren = isTrashNode
  //   ? foldersStore.singleLayerNodes.filter((node) => node.parentId === nodeData.id)
  //   : [];

  // const folderHasContentsNonRoot =
  //   !nodeData.isFile && !nodeData.isRoot
  //     ? foldersStore.singleLayerNodes.find((node) => node.path.includes(nodeData.path) && node.id !== nodeData.id)
  //     : undefined;
  const folderHasContents = !nodeData.isFile
    ? foldersStore.singleLayerNodes.find(
        (node) => node.namePath.startsWith(nodeData.namePath) && node.id !== nodeData.id,
      )
    : undefined;
  // const folderHasContents = folderHasContentsNonRoot || folderHasContentsRoot;

  const folderHasFileDescendants = !nodeData.isFile
    ? foldersStore.singleLayerNodes.find((node) => node.namePath.startsWith(nodeData.namePath) && node.isFile)
    : undefined;

  // if (isTrashNode) {
  //   console.log(nodeData);
  //   console.log(trashNodeImmediateChildren);
  //   console.log(folderHasContents);
  //   console.log(folderHasFileDescendants);
  // }

  const menuItemsConfig: MenuItemData[] = [
    {
      label: "Rename",
      icon: Pencil,
      action: () => {
        if (isLoading) {
          return;
        }
        renameModal.onOpen(nodeData);
      },
    },
    {
      label: inTrash ? "Restore" : "Move",
      icon: inTrash ? Undo2 : nodeData.isFile ? FileInput : FolderInput,
      isFile: true,
      action: () => {
        {
          if (isLoading) {
            return;
          }
          moveModal.onOpen([nodeData]);
        }
      },
    },
    {
      label: "Restore Root",
      icon: Undo2,
      action: async () => {
        if (isLoading) {
          return;
        }
        const promise = axios
          .post("/api/patient-update", {
            selectedId: nodeData.id,
            updateType: "restoreRootFolder",
          })
          .then(({ data }) => {
            foldersStore.restoreRootNode([nodeData.id]);
            // Success handling
          })
          .catch((error) => {
            // Error handling
            throw error; // Rethrow to allow the toast to catch it
          });

        toast.promise(promise, {
          loading: "Restoring node",
          success: "Changes saved successfully",
          error: "Something went wrong",
          duration: 1250,
        });

        try {
          await promise; // Wait for the current promise to resolve or reject
        } catch (error) {
          // Error handling if needed
        }
      },
    },
    {
      label: "Add a subfolder",
      icon: FolderPlus,
      action: () => {
        if (isLoading) {
          return;
        }
        addFolderModal.onOpen(nodeData, false);
      },
    },
    {
      label: "Upload files",
      icon: Upload,
      action: () => {
        if (isLoading) {
          return;
        }
        uploadFilesModal.onOpen(nodeData, false);
      },
    },
    {
      label: "Export",
      icon: Download,
      action: () => {
        if (isLoading) {
          return;
        }
        downloadModal.onOpen([nodeData]);
      },
    },
    {
      label: isTrashNode ? "Empty Trash" : inTrash ? "Delete" : "Trash",
      icon: Trash,
      action: () => {
        if (isLoading) {
          return;
        }
        isTrashNode
          ? deleteModal.onOpen([nodeData], true)
          : inTrash
          ? deleteModal.onOpen([nodeData], false)
          : trashModal.onOpen([nodeData]);
      },
      differentClassName: "font-normal text-red-400 focus:text-red-500",
    },
  ];

  const menuItems = menuItemsConfig.filter((item) => {
    const itemLabel = item.label;
    if ((!nodeData.parentId || (inTrash && nodeData.isRoot)) && (itemLabel === "Move" || itemLabel === "Restore")) {
      return false;
    }
    if (itemLabel === "Rename" && (nodeData.isRoot || inTrash)) {
      return false;
    }
    if ((nodeData.isFile || inTrash) && (itemLabel === "Upload files" || itemLabel === "Add a subfolder")) {
      return false;
    }
    if (isTrashNode && itemLabel === "Delete") {
      return false;
    }
    if ((!inTrash || !nodeData.isRoot || isTrashNode) && itemLabel === "Restore Root") {
      return false;
    }
    if (isTrashNode && itemLabel === "Empty Trash" && !folderHasContents) {
      return false;
    }
    if (!currentUserPermissions.canAdd) {
      if (itemLabel === "Upload files" || itemLabel === "Add a subfolder") {
        return false;
      }
    }
    if (!currentUserPermissions.canEdit) {
      if (itemLabel === "Move" || itemLabel === "Rename") {
        return false;
      }
    }
    if (!currentUserPermissions.canDelete) {
      if (itemLabel === "Empty Trash" || itemLabel === "Delete" || itemLabel === "Trash") {
        return false;
      }
    }
    if (!currentUserPermissions.isPatient) {
      if (itemLabel === "Restore" || itemLabel === "Restore Root") {
        return false;
      }
    }
    if (isRestricted && itemLabel === "Export") {
      console.log("211");
      return false;
    }
    // if (!item.isFile && itemLabel === "Export" && (!folderHasContents || !folderHasFileDescendants)) {
    //   return false;
    // }
    return true; // Include the item if none of the conditions above match
  });

  return menuItems;
};
