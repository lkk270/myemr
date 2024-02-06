import { create } from "zustand";
import { MedicationType } from "@/app/types";

interface useDeleteMedicationStore {
  isOpen: boolean;
  medication: MedicationType | null;
  onOpen: (medication: MedicationType) => void;
  onClose: () => void;
}

export const useDeleteMedicationModal = create<useDeleteMedicationStore>((set) => ({
  isOpen: false,
  medication: null,
  onOpen: (medication) => set({ isOpen: true, medication: medication }),
  onClose: () => set({ isOpen: false }),
}));
