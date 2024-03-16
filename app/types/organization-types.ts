import { Organization, OrganizationAddress, OrganizationMemberRole } from "@prisma/client";

export type OrganizationWithRoleType = Organization & {
  role: OrganizationMemberRole;
  addresses?: OrganizationAddress[];
};
