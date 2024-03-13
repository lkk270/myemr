import * as z from "zod";
import { rootFolderCategories } from "@/lib/constants";

export const NewOrganization = z.object({
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
    .refine((value) => typeof value === "undefined" || (value.length > 1 && value.length <= 250), {
      message: "Must be longer than 1 characters and not exceed 250 characters if specified",
    }),

  description: z
    .string()
    .optional()
    .refine((value) => typeof value === "undefined" || (value.length > 1 && value.length <= 1000), {
      message: "Must be longer than 1 characters and not exceed 1000 characters if specified",
    }),

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

  providerProfileId: z
    .string()
    .min(1, {
      message: "Minimum of 6 characters required",
    })
    .max(125, { message: "Maximum of 30 characters" }),
});
