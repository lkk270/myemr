import { create } from "zustand";
import { MedicationType } from "@/app/types";
import { DosageHistory } from "@prisma/client";
interface MedicationStore {
  medications: MedicationType[];
  medicationsSet: boolean; // New field to track if medications have been set
  setMedications: (medications: MedicationType[]) => void;
  addMedication: (medication: MedicationType) => void;
  updateMedication: (updatedMedication: MedicationType, newDosageHistory?: DosageHistory) => void;
  deleteMedication: (medicationId: string) => void;
  isMedicationNameExist: (name: string) => boolean;
}

export const useMedicationStore = create<MedicationStore>((set, get) => ({
  medications: [],
  medicationsSet: false, // Initial value is false
  setMedications: (medications) => set({ medications, medicationsSet: true }),
  addMedication: (medication) => set((state) => ({ medications: [...state.medications, medication] })),
  updateMedication: (updatedMedication, newDosageHistory) =>
    set((state) => ({
      medications: state.medications.map((medication) => {
        if (medication.id === updatedMedication.id) {
          return {
            ...updatedMedication,
            dosageHistory: newDosageHistory
              ? [...(medication.dosageHistory || []), newDosageHistory]
              : medication.dosageHistory,
          };
        }
        return medication;
      }),
    })),
  deleteMedication: (medicationId) =>
    set((state) => ({
      medications: state.medications.filter((medication) => medication.id !== medicationId),
    })),
  isMedicationNameExist: (name) => {
    const state = get(); // Correctly use 'get' to access the state
    return state.medications.some((medication) => medication.name === name);
  },
}));
