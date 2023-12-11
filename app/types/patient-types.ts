import { Unit, Address, DosageHistory } from "@prisma/client";

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
  addresses: Address[] | any;
};


export type MedicationType = {
  id: string;
  userId: string;
  patientProfileId: string;
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
