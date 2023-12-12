import { create } from "zustand";
import { MedicationType, NewMedicationType } from "@/app/types";

interface MedicationStore {
  medications: MedicationType[];
  setMedications: (medications: MedicationType[]) => void;
  addMedication: (medication: MedicationType) => void;
  updateMedication: (updatedMedication: MedicationType) => void;
}

export const useMedicationStore = create<MedicationStore>((set) => ({
  medications: [],
  setMedications: (medications) => set({ medications }),
  addMedication: (medication) => set((state) => ({ medications: [...state.medications, medication] })),
  updateMedication: (updatedMedication) =>
    set((state) => ({
      medications: state.medications.map((medication) =>
        medication.id === updatedMedication.id ? updatedMedication : medication,
      ),
    })),
}));
