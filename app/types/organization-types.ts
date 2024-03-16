import {
  Organization,
  OrganizationAddress,
  OrganizationMemberRole,
  OrganizationTags,
  OrganizationType,
} from "@prisma/client";

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
  backgroundImageUrl?: string | null;
  profileImageUrl?: string | null;
  acceptMessages?: boolean;
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
