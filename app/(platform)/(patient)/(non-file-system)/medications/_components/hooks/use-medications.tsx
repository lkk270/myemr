import { create } from "zustand";
import { MedicationType } from "@/app/types";

interface MedicationStore {
  medications: MedicationType[];
  medicationsSet: boolean; // New field to track if medications have been set
  setMedications: (medications: MedicationType[]) => void;
  addMedication: (medication: MedicationType) => void;
  updateMedication: (updatedMedication: MedicationType) => void;
  isMedicationNameExist: (name: string) => boolean;
}

export const useMedicationStore = create<MedicationStore>((set, get) => ({
  medications: [],
  medicationsSet: false, // Initial value is false
  setMedications: (medications) => set({ medications, medicationsSet: true }),
  addMedication: (medication) => set((state) => ({ medications: [...state.medications, medication] })),
  updateMedication: (updatedMedication) =>
    set((state) => ({
      medications: state.medications.map((medication) =>
        medication.id === updatedMedication.id ? updatedMedication : medication,
      ),
    })),
  isMedicationNameExist: (name) => {
    const state = get(); // Correctly use 'get' to access the state
    return state.medications.some((medication) => medication.name === name);
  },
}));
