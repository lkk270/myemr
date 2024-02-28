import { create } from "zustand";
import { patientForManageAccountType } from "@/app/types";

type PatientForManageAccountStore = {
  patient: patientForManageAccountType | null;
  setPatient: (newPatient: patientForManageAccountType) => void;
};

export const usePatientForManageAccount = create<PatientForManageAccountStore>((set) => ({
  patient: null,
  setPatient: (newPatient) =>
    set(() => ({
      patient: newPatient,
    })),
}));
