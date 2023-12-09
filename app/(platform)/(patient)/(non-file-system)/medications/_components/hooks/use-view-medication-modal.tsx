import { create } from "zustand";
import { Medication } from "@prisma/client";

interface useViewMedicationStore {
  isOpen: boolean;
  medication: Medication | null;
  onOpen: (medication: Medication) => void;
  onClose: () => void;
}

export const useViewMedicationModal = create<useViewMedicationStore>((set) => ({
  isOpen: false,
  medication: null,
  onOpen: (medication) => set({ isOpen: true, medication: medication }),
  onClose: () => set({ isOpen: false }),
}));
