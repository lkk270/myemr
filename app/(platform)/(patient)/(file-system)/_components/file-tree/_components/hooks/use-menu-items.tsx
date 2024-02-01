import { Pencil, Upload, FileInput, Download, Trash, FolderPlus } from "lucide-react";
import { MenuItemData } from "@/app/types/file-types";

import {
  useTrashModal,
  useDownloadModal,
  useRenameModal,
  useAddFolderModal,
  useMoveModal,
  useUploadFilesModal,
} from ".";

export const useMenuItems = (nodeData: any) => {
  const trashModal = useTrashModal();
  const downloadModal = useDownloadModal();
  const renameModal = useRenameModal();
  const moveModal = useMoveModal();
  const addFolderModal = useAddFolderModal();
  const uploadFilesModal = useUploadFilesModal();

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
        moveModal.onOpen([nodeData]);
      },
    },
    {
      label: "Add a subfolder",
      icon: FolderPlus,
      action: () => addFolderModal.onOpen(nodeData, false),
    },
    {
      label: "Upload files",
      icon: Upload,
      action: () => uploadFilesModal.onOpen(nodeData, false),
    },
    {
      label: "Export",
      icon: Download,
      action: () => downloadModal.onOpen([nodeData]),
    },
    {
      label: "Trash",
      icon: Trash,
      action: () => trashModal.onOpen([nodeData]),
      differentClassName: "font-normal text-red-400 focus:text-red-500",
    },
  ];

  return menuItems;
};
