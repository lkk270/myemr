import { create } from "zustand";
import { Medication } from "@prisma/client";

interface useNewMedicationStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useNewMedicationModal = create<useNewMedicationStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
