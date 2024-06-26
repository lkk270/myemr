import { create } from "zustand";
import { NodeDataType } from "@/app/types/file-types";

interface useTrashModalStore {
  isOpen: boolean;
  nodeDatas: NodeDataType[] | null;
  onOpen: (nodeDatas: NodeDataType[]) => void;
  onClose: () => void;
}

export const useTrashModal = create<useTrashModalStore>((set) => ({
  isOpen: false,
  nodeDatas: null,
  onOpen: (nodeDatas) => set({ isOpen: true, nodeDatas }),
  onClose: () => set({ isOpen: false }),
}));
