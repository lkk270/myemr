import { create } from "zustand";
import { NodeDataType } from "@/app/types/file-types";

interface useMoveModalStore {
  isOpen: boolean;
  nodeData: NodeDataType | null;
  onOpen: (nodeData: NodeDataType) => void;
  onClose: () => void;
}

export const useMoveModal = create<useMoveModalStore>((set) => ({
  isOpen: false,
  nodeData: null,
  onOpen: (nodeData) => set({ isOpen: true, nodeData }),
  onClose: () => set({ isOpen: false }),
}));
