import { create } from "zustand";
import { MedicationType } from "@/app/types";
import { DosageHistory } from "@prisma/client";

interface MedicationStore {
  medications: MedicationType[];
  medicationsSet: boolean;
  setMedications: (medications: MedicationType[]) => void;
  addMedication: (medication: MedicationType) => void;
  updateMedication: (updatedMedication: MedicationType, newDosageHistory?: DosageHistory | null) => void;
  deleteMedication: (medicationId: string) => void;
  isMedicationNameExist: (name: string) => boolean;
  getMedicationById: (id: string) => MedicationType | undefined;
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
              ? [newDosageHistory, ...(medication.dosageHistory || [])]
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
  getMedicationById: (id) => {
    const state = get();
    return state.medications.find((medication) => medication.id === id);
  },
}));
