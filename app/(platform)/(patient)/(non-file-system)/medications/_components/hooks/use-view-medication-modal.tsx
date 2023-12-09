import { create } from "zustand";
import { Medication } from "@prisma/client";

interface useViewMedicationStore {
  isOpen: boolean;
  isEdit: boolean;
  medication: Medication | null;
  onOpen: (medication: Medication, isEdit: boolean) => void;
  onClose: () => void;
}

export const useViewMedicationModal = create<useViewMedicationStore>((set) => ({
  isOpen: false,
  medication: null,
  isEdit: false,
  onOpen: (medication, isEdit) => set({ isOpen: true, medication: medication, isEdit: isEdit }),
  onClose: () => set({ isOpen: false }),
}));
