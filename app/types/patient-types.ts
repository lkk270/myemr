import { Address } from "@prisma/client";
import { Unit } from "@prisma/client";

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
