import { OrganizationMember, OrganizationMemberRole, OrganizationType, PatientMember } from "@prisma/client";

type SpecialOrganizationAddress = {
  id: string;
  name: string;
  phone?: string | null;
  address: string;
  address2?: string | null;
  city: string;
  state: string;
  zipcode: string;
  organizationId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type SpecialOrganizationType = {
  id: string;
  title: string;
  category: string;
  subTitle?: string | null;
  description?: string | null;
  connectCode: string;
  backgroundImageUrl?: string | null;
  profileImageUrl?: string | null;
  acceptMessages?: boolean;
  numOfUnreadActivities: number;
  organizationType: OrganizationType;
  mainEmail?: string | null;
  mainPhone?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};
export type OrganizationWithRoleType = SpecialOrganizationType & {
  role: OrganizationMemberRole;
  addresses?: SpecialOrganizationAddress[];
};

export type OrganizationMemberType = OrganizationMember & {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export type PatientMemberType1 = PatientMember & {
  patientProfile: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth?: string | null;
    imageUrl?: string | null;
    symmetricKey: string;
  };
};

export type PatientMemberType2 = PatientMember & {
  patientProfile: {
    id: string;
    name: string;
    email: string;
    dateOfBirth?: string | null;
    imageUrl?: string | null;
  };
};
