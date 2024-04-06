import * as z from "zod";
import { PatientMemberRole } from "@prisma/client";

export const AddOrganizationSchema = z.object({
  patientJoinToken: z.string().length(8, { message: "invalid add token" }),
  role: z.enum([PatientMemberRole.READ_ONLY, PatientMemberRole.READ_AND_ADD, PatientMemberRole.FULL_ACCESS]),
  accessibleRootFolderIds: z.string(),
});

export const ChangeOrganizationRoleSchema = z.object({
  memberId: z.string(),
  role: z.enum([PatientMemberRole.READ_ONLY, PatientMemberRole.READ_AND_ADD, PatientMemberRole.FULL_ACCESS]),
});

export const RemoveOrganizationSchema = z.object({
  memberId: z.string(),
});
