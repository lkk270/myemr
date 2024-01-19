import { Pencil, FolderInput, FileInput, Download, Trash, FolderPlus } from "lucide-react";
import { MenuItemData } from "@/app/types/file-types";

import { useDeleteModal, useDownloadModal, useRenameModal, useAddFolderModal, useMoveModal } from ".";

export const useMenuItems = (nodeData: any) => {
  const deleteModal = useDeleteModal();
  const downloadModal = useDownloadModal();
  const renameModal = useRenameModal();
  const moveModal = useMoveModal();
  const addFolderModal = useAddFolderModal();

  const menuItems: MenuItemData[] = [
    {
      label: "Rename",
      icon: Pencil,
      action: () => renameModal.onOpen(nodeData),
    },
    {
      label: "Move",
      icon: FileInput,
      isFile: true,
      action: () => {
        moveModal.onOpen(nodeData);
      },
    },
    {
      label: "Add a subfolder",
      icon: FolderPlus,
      action: () => addFolderModal.onOpen(nodeData, false),
    },
    {
      label: "Export",
      icon: Download,
      action: () => downloadModal.onOpen(nodeData),
    },
    {
      label: "Delete",
      icon: Trash,
      action: () => deleteModal.onOpen(nodeData),
      differentClassName: "font-normal text-red-400 focus:text-red-500",
    },
  ];

  return menuItems;
};
