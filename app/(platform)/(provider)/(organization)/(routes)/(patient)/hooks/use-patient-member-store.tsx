import { create } from "zustand";
import { PatientMember } from "@prisma/client";

interface PatientMemberStore {
  patientMember: PatientMember | null;
  patientMemberSet: boolean;
  setPatientMember: (patientMember: PatientMember) => void;
}

export const usePatientMemberStore = create<PatientMemberStore>((set, get) => ({
  patientMember: null,
  patientMemberSet: false, // Initial value is false
  setPatientMember: (patientMember) => set({ patientMember, patientMemberSet: true }),
}));
