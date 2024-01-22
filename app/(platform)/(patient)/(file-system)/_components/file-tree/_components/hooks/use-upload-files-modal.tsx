import { create } from "zustand";
import { NodeDataType } from "@/app/types/file-types";

interface useUploadFilesStore {
  isOpen: boolean;
  nodeData: any;
  showDropdown: boolean;
  onOpen: (nodeData: NodeDataType, showDropdown: boolean) => void;
  onClose: () => void;
}

export const useUploadFilesModal = create<useUploadFilesStore>((set) => ({
  isOpen: false,
  showDropdown: false,
  nodeData: null,
  onOpen: (nodeData, showDropdown) => set({ isOpen: true, nodeData, showDropdown }),
  onClose: () => set({ isOpen: false }),
}));
