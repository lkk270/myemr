import { Organization, OrganizationMemberRole } from "@prisma/client";

export type OrganizationWithRoleType = Organization & {
  role: OrganizationMemberRole;
};
