import { Unit, PatientAddress, DosageHistory, UserRole, PatientPlan } from "@prisma/client";

export type PatientDemographicsType = {
  imageUrl: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  maritalStatus?: string | null;
  race?: string | null;
  mobilePhone?: string | null;
  homePhone?: string | null;
  height?: string | null;
  weight?: string | null;
  unit: Unit;
  insuranceProvider?: string | null;
  policyNumber?: string | null;
  groupNumber?: string | null;
  addresses: PatientAddress[] | any;
  insuranceImagesSet: boolean;
};

export type PatientDemographicsContactType = {
  mobilePhone?: string | null;
  homePhone?: string | null;
  email: string;
  addresses: PatientAddress[] | any;
};

export type MedicationType = {
  id: string;
  userId?: string;
  patientProfileId?: string;
  name: string;
  prescribedById?: string | null;
  prescribedByName: string;
  category: string;
  dosage: string;
  dosageUnits: string;
  frequency: string;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  dosageHistory: DosageHistory[];
};

export type NewMedicationType = {
  name: string;
  prescribedById?: string | null;
  prescribedByName: string;
  category: string;
  dosage: string;
  dosageUnits: string;
  frequency: string;
  description?: string | null;
  status: string;
};

export type PartialDosageHistoryType = {
  dosage: string;
  dosageUnits: string;
  frequency: string;
};

export type genericPatientAccessCodeType = {
  id: string;
  accessType?: UserRole;
  token: string;
  expires: Date;
  isValid: boolean;
  providerEmail?: string;
  createdAt: Date;
};

export type patientForManageAccountType = {
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  plan: PatientPlan;
};

export type accessCodeType = "patientProfileAccessCode" | "requestRecordsCode";
