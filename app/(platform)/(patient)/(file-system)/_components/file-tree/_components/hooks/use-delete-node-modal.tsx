import { create } from "zustand";
import { NodeDataType } from "@/app/types/file-types";

interface useDeleteModalStore {
  isOpen: boolean;
  forEmptyTrash: boolean;
  nodeDatas: NodeDataType[] | null;
  onOpen: (nodeDatas: NodeDataType[], forEmptyTrash: boolean) => void;
  onClose: () => void;
}

export const useDeleteModal = create<useDeleteModalStore>((set) => ({
  isOpen: false,
  nodeDatas: null,
  forEmptyTrash: false,
  onOpen: (nodeDatas, forEmptyTrash) => set({ isOpen: true, nodeDatas, forEmptyTrash }),
  onClose: () => set({ isOpen: false }),
}));
