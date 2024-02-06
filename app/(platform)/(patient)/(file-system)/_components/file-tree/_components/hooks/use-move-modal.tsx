import { create } from "zustand";
import { NodeDataType } from "@/app/types/file-types";

interface useMoveModalStore {
  isOpen: boolean;
  nodeDatas: NodeDataType[] | null;
  onOpen: (nodeDatas: NodeDataType[]) => void;
  onClose: () => void;
}

export const useMoveModal = create<useMoveModalStore>((set) => ({
  isOpen: false,
  nodeDatas: null,
  onOpen: (nodeDatas) => set({ isOpen: true, nodeDatas }),
  onClose: () => set({ isOpen: false }),
}));
