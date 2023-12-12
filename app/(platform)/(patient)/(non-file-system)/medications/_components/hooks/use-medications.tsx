import { create } from "zustand";
import { MedicationType } from "@/app/types";

interface MedicationStore {
  medications: MedicationType[];
  setMedications: (medications: MedicationType[]) => void;
  addMedication: (medication: MedicationType) => void;
  updateMedication: (updatedMedication: MedicationType) => void;
  isMedicationNameExist: (name: string) => boolean;
}

export const useMedicationStore = create<MedicationStore>((set, get) => ({
  medications: [],
  setMedications: (medications) => set({ medications }),
  addMedication: (medication) => set((state) => ({ medications: [...state.medications, medication] })),
  updateMedication: (updatedMedication) =>
    set((state) => ({
      medications: state.medications.map((medication) =>
        medication.id === updatedMedication.id ? updatedMedication : medication,
      ),
    })),
  isMedicationNameExist: (name) => {
    const state = get();
    return state.medications.some((medication) => medication.name === name);
  },
}));
