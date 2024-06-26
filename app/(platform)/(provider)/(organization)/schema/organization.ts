import * as z from "zod";
import { fieldCategories, states } from "@/lib/constants";
import { OrganizationMemberRole, OrganizationType } from "@prisma/client";

export const AddressSchema = z.object({
  id: z.string(),
  name: z.string().refine((value) => value.length > 1 && value.length <= 70, {
    message: "Must be longer than 1 character and not exceed 70 characters",
  }),
  address: z.string().max(100, { message: "Address cannot be greater than 100 characters" }),
  address2: z
    .string()
    .max(100, { message: "Second address cannot be greater than 100 characters" })
    .optional()
    .nullable(),
  city: z.string().max(100, { message: "City cannot be greater than 100 characters" }),
  state: z.string().refine(
    (value) => {
      // Perform validation against states array
      return states.some((item) => item.value === value);
    },
    {
      message: "State must match a value in the states list",
    },
  ),

  zipcode: z
    .string()

    .refine(
      (value) => {
        // Perform regex validation for zip code
        return /^(\d{5})(-\d{4})?$/.test(value);
      },
      {
        message: "Zip code is not valid",
      },
    ),
  phone: z
    .string()
    .optional()
    .nullable()
    .refine((value) => typeof value === "undefined" || !value || value.length === 0 || value.length === 10, {
      message: "Home phone must have 10 characters if provided",
    }),
});

const TagSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});

export const OrganizationSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "Minimum of 1 characters required",
    })
    .max(125, { message: "Maximum of 125 characters" }),

  category: z.string().refine(
    (value) => {
      return fieldCategories.some((item) => item.value === value);
    },
    {
      message: "Name must match a value in the fieldCategories",
    },
  ),
  subTitle: z
    .string()
    .optional()
    .refine(
      (value) => typeof value === "undefined" || value.length === 0 || (value.length > 1 && value.length <= 250),
      {
        message: "Must be longer than 1 character and not exceed 250 characters if specified",
      },
    ),

  description: z
    .string()
    .optional()
    .refine(
      (value) => typeof value === "undefined" || value.length === 0 || (value.length > 1 && value.length <= 1000),
      {
        message: "Must be longer than 1 character and not exceed 1000 characters if specified",
      },
    ),

  backgroundImageUrl: z
    .string()
    .optional()
    .refine((value) => typeof value === "undefined" || (value.length > 6 && value.length <= 500), {
      message: "Must be longer than 6 characters and not exceed 500 characters if specified",
    }),

  profileImageUrl: z
    .string()
    .optional()
    .refine((value) => typeof value === "undefined" || (value.length > 6 && value.length <= 500), {
      message: "Must be longer than 6 characters and not exceed 500 characters if specified",
    }),

  acceptMessages: z.boolean().optional(),
  organizationType: z.enum([
    OrganizationType.CLINIC,
    OrganizationType.CLINICAL_TRIAL,
    OrganizationType.PRIVATE_PRACTICE,
  ]),
  // tags: z.array(TagSchema).max(8, { message: "Maximum of 8 tags allowed" }),
  mainEmail: z
    .string()
    .email({ message: "Not a valid email" })
    .max(320, { message: "Maximum of 320 characters" })
    .optional(),
  mainPhone: z
    .string()
    .optional()
    .refine((value) => typeof value === "undefined" || value.length === 0 || value.length === 10, {
      message: "Home phone must have 10 characters if provided",
    }),
  addresses: z.array(AddressSchema).max(4, { message: "Maximum of 4 addresses allowed" }),
});

export const JoinOrganizationSchema = z.object({
  inviteToken: z.string().length(6, { message: "Invite code must be 6 characters long" }),
});

export const InviteMemberSchema = z.object({
  organizationId: z.string(),
  email: z.string().email().max(320, { message: "Maximum of 320 characters" }),
  role: z.enum([OrganizationMemberRole.ADMIN, OrganizationMemberRole.USER]),
});

export const ChangeOrganizationMemberRoleSchema = z.object({
  organizationId: z.string(),
  memberId: z.string(),
  role: z.enum([OrganizationMemberRole.OWNER, OrganizationMemberRole.ADMIN, OrganizationMemberRole.USER]),
});

export const DeleteOrganizationMemberSchema = z.object({
  organizationId: z.string(),
  memberId: z.string(),
});
