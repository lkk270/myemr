import * as z from "zod";
import { rootFolderCategories } from "@/lib/constants";
import { OrganizationType } from "@prisma/client";
import { AddressSchema } from "@/lib/schemas/address";

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
      return rootFolderCategories.some((item) => item.value === value);
    },
    {
      message: "Name must match a value in the rootFolderCategories",
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
  tags: z.array(TagSchema).max(8, { message: "Maximum of 8 tags allowed" }),
  officeEmail: z.string().email({ message: "Not a valid email" }).optional(),
  officePhone: z
    .string()
    .optional()
    .refine((value) => typeof value === "undefined" || value.length === 0 || value.length === 10, {
      message: "Home phone must have 10 characters if provided",
    }),
  address: z.array(AddressSchema).max(4, { message: "Maximum of 4 addresses allowed" }),
});

export const JoinOrganization = z.object({
  inviteCode: z.string().length(8, { message: "Invite code must be 8 characters long" }),
});
