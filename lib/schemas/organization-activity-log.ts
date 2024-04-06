import { OrganizationMemberRole, PatientMemberRole } from "@prisma/client";
import { OrganizationActivityType } from "@prisma/client";
import * as z from "zod";

const ProviderAddedSchema = z.object({
  email: z.string().email().max(320, {
    message: "Minimum 320 characters required",
  }),
  role: z.enum([OrganizationMemberRole.ADMIN, OrganizationMemberRole.OWNER, OrganizationMemberRole.USER]),
});

const AddedByPatientSchema = z.object({
  patientEmail: z.string().email().max(320, {
    message: "Minimum 320 characters required",
  }),
  role: z.enum([PatientMemberRole.READ_ONLY, PatientMemberRole.READ_AND_ADD, PatientMemberRole.FULL_ACCESS]),
});

// Define a base schema for common fields
const OrganizationActivityLogPostSchema = z
  .object({
    href: z.string().optional(),
    organizationId: z.string(),
    type: z.enum([
      OrganizationActivityType.INVITE_ACCEPTED,
      OrganizationActivityType.PROVIDER_ADDED,
      OrganizationActivityType.ADDED_BY_PATIENT,
    ]),
    dynamicData: z.any(), // Temporarily set to `any`, will refine based on the type
  })
  .superRefine((obj, ctx) => {
    let schema;
    switch (obj.type) {
      case "INVITE_ACCEPTED":
        schema = ProviderAddedSchema;
        break;
      case "PROVIDER_ADDED":
        schema = ProviderAddedSchema;
        break;
      case "ADDED_BY_PATIENT":
        schema = AddedByPatientSchema;
        break;
      default:
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid organization activity log type",
        });
        return;
    }
    const result = schema.safeParse(obj.dynamicData);
    if (!result.success) {
      result.error.issues.forEach((issue) => ctx.addIssue(issue));
    }
  });

export { OrganizationActivityLogPostSchema };
