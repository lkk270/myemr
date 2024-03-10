import * as z from "zod";
import { genders, races, martialStatuses, heightsImperial, states } from "@/lib/constants";
import { AddressSchema } from "@/lib/schemas/address";
export const PersonalInformationSchema = z.object({
  firstName: z.string().min(1, {
    message: "Minimum of 1 characters required",
  }),
  lastName: z.string().min(1, {
    message: "Minimum of 1 characters required",
  }),
  dateOfBirth: z
    .string()
    .nullable()
    .refine(
      (value) => {
        return value === null || /^\d{4}-\d{2}-\d{2}$/.test(value);
      },
      {
        message: "Date of birth must be in the format of YYYY-MM-DD or null",
      },
    ),
  gender: z
    .string()
    .nullable()
    .refine((value) => value === null || genders.some((item) => item.value === value), {
      message: "Gender must match a value in the genders list or be null",
    }),

  race: z
    .string()
    .nullable()
    .refine((value) => value === null || races.some((item) => item.value === value), {
      message: "Race must match a value in the races list or be null",
    }),

  maritalStatus: z
    .string()
    .nullable()
    .refine((value) => value === null || martialStatuses.some((item) => item.value === value), {
      message: "Martial Status must match a value in the martialStatuses list or be null",
    }),

  height: z
    .string()
    .nullable()
    .refine((value) => value === null || heightsImperial.some((item) => item.value === value), {
      message: "Heights must match a value in the heights list or be null",
    }),
  weight: z
    .string()
    .nullable()
    .refine((value) => value === null || (value.length >= 2 && value.length <= 4), {
      message: "Weight must be between 2 to 4 characters if provided",
    }),
});

export const ContactInformationSchema = z.object({
  mobilePhone: z
    .string()
    .nullable()
    .refine((value) => value === null || value.length === 10, {
      message: "Mobile phone must have 10 characters if provided",
    }),
  homePhone: z
    .string()
    .nullable()
    .refine((value) => value === null || value.length === 10, {
      message: "Home phone must have 10 characters if provided",
    }),
  address: AddressSchema,
});
