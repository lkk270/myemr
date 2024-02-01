import { Pencil, Upload, FileInput, Download, Trash, FolderPlus } from "lucide-react";
import { MenuItemData } from "@/app/types/file-types";
import { useIsLoading } from "@/hooks/use-is-loading";
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
  const { isLoading } = useIsLoading();

  const menuItems: MenuItemData[] = [
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
      label: "Move",
      icon: FileInput,
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
      label: "Trash",
      icon: Trash,
      action: () => {
        if (isLoading) {
          return;
        }
        trashModal.onOpen([nodeData]);
      },
      differentClassName: "font-normal text-red-400 focus:text-red-500",
    },
  ];

  return menuItems;
};
