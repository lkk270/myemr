import { create } from "zustand";
import { NodeDataType } from "@/app/types/file-types";

interface useAddFolderModalStore {
  isOpen: boolean;
  nodeData: NodeDataType | null;
  showDropdown: boolean;
  onOpen: (nodeData: NodeDataType | null, showDropdown: boolean) => void;
  onClose: () => void;
}

export const useAddFolderModal = create<useAddFolderModalStore>((set) => ({
  isOpen: false,
  showDropdown: false,
  nodeData: null,
  onOpen: (nodeData, showDropdown) => set({ isOpen: true, nodeData, showDropdown }),
  onClose: () => set({ isOpen: false }),
}));
