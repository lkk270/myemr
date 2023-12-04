import { Address } from "@prisma/client";

export type PatientDemographicsType = {
  imageUrl: string;
  firstName: string;
  lastName: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  maritalStatus?: string | null;
  race?: string | null;
  mobilePhone?: string | null;
  homePhone?: string | null;
  insuranceProvider?: string | null;
  policyNumber?: string | null;
  groupNumber?: string | null;
  addresses: Address[] | any;
};
