import { create } from "zustand";
import { NodeDataType } from "@/app/types/file-types";

interface useRenameModalStore {
  isOpen: boolean;
  nodeData: any;
  onOpen: (nodeData: NodeDataType) => void;
  onClose: () => void;
}

export const useRenameModal = create<useRenameModalStore>((set) => ({
  isOpen: false,
  nodeData: null,
  onOpen: (nodeData) => set({ isOpen: true, nodeData }),
  onClose: () => set({ isOpen: false }),
}));
