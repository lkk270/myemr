import { create } from "zustand";

type UsePatientManageAccountModalStore = {
  isOpen: boolean;
  defaultScrollTo: string | null;
  onOpen: (defaultScrollTo?: string) => void;
  onClose: () => void;
  toggle: () => void;
};

export const usePatientManageAccountModal = create<UsePatientManageAccountModalStore>((set, get) => ({
  isOpen: false,
  defaultScrollTo: null,
  onOpen: (defaultScrollTo?: string) => set({ isOpen: true, defaultScrollTo: defaultScrollTo }),
  onClose: () => set({ isOpen: false }),
  toggle: () => set({ isOpen: !get().isOpen }),
}));
