import { create } from "zustand";
import { PatientMemberType2 } from "@/app/types";

interface PatientsStore {
  patients: PatientMemberType2[];
  patientsSet: boolean; // New field to track if patients have been set
  setPatients: (patients: PatientMemberType2[]) => void;
  addPatient: (patient: PatientMemberType2) => void;
  getPatientById: (id: string) => PatientMemberType2 | undefined;
}

export const usePatientsStore = create<PatientsStore>((set, get) => ({
  patients: [],
  patientsSet: false, // Initial value is false
  setPatients: (patients) => set({ patients, patientsSet: true }),
  addPatient: (patient) => set((state) => ({ patients: [...state.patients, patient] })),
  getPatientById: (id) => {
    const state = get();
    return state.patients.find((patient) => patient.id === id);
  },
}));
