import { create } from "zustand";

interface useUploadInsuranceModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useUploadInsuranceModal = create<useUploadInsuranceModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
