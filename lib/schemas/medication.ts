import * as z from "zod";
import { medicationsList, fieldCategories, dosageUnits, dosageFrequency } from "../constants";

export const NewMedicationSchema = z.object({
  patientMemberId: z.string().optional().nullable(),
  name: z
    .string()
    .min(2, {
      message: "Minimum of 2 characters required",
    })
    .max(70, {
      message: "Maximum of 70 character required",
    }),

  // .refine(
  //   (value) => {
  //     return medicationsList.some((item) => item.value === value);
  //   },
  //   {
  //     message: "Name must match a value in the medicationsList",
  //   },
  // ),
  prescribedById: z
    .string()
    .optional()
    .refine(
      (value) => {
        return typeof value === "undefined" || value.length > 6;
      },
      {
        message: "Must be longer than 6 characters if specified",
      },
    ),
  prescribedByName: z
    .string()
    .min(2, {
      message: "Minimum of 2 characters required",
    })
    .max(70, {
      message: "Maximum of 70 characters required",
    }),
  category: z.string().refine(
    (value) => {
      return fieldCategories.some((item) => item.value === value);
    },
    {
      message: "Name must match a value in the fieldCategories",
    },
  ),
  dosage: z
    .string()
    .min(1, { message: "Minimum of 1 character required" })
    .max(10, { message: "No more than 10 characters allowed" })
    .refine((value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0, {
      message: "Dosage must be a positive number",
    }),
  dosageUnits: z
    .string()
    .min(1, {
      message: "Minimum of 1 character required",
    })
    .max(15, {
      message: "Maximum of 15 character required",
    }),

  // .refine(
  //   (value) => {
  //     return dosageUnits.some((item) => item.value === value);
  //   },
  //   {
  //     message: "Name must match a value in the dosageUnits",
  //   },
  // ),
  frequency: z.string().refine(
    (value) => {
      return dosageFrequency.some((item) => item.value === value);
    },
    {
      message: "Name must match a value in the dosageFrequency",
    },
  ),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

export const EditMedicationSchema = z.object({
  patientMemberId: z.string().optional().nullable(),
  id: z.string().min(6, {
    message: "Minimum of 6 characters required",
  }),

  prescribedById: z
    .string()
    .optional()
    .refine(
      (value) => {
        return typeof value === "undefined" || value.length > 6;
      },
      {
        message: "Must be longer than 6 characters if specified",
      },
    )
    .nullable(),
  prescribedByName: z
    .string()
    .min(6, {
      message: "Minimum of 6 characters required",
    })
    .max(70, {
      message: "Maximum of 70 characters required",
    }),
  category: z.string().refine(
    (value) => {
      return fieldCategories.some((item) => item.value === value);
    },
    {
      message: "Name must match a label in the medicationsList",
    },
  ),
  dosage: z
    .string()
    .min(1, { message: "Minimum of 1 character required" })
    .max(10, { message: "No more than 10 characters allowed" })
    .refine((value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0, {
      message: "Dosage must be a positive number",
    }),
  dosageUnits: z
    .string()
    .min(1, {
      message: "Minimum of 1 character required",
    })
    .max(15, {
      message: "Maximum of 15 character required",
    }),
  frequency: z.string().refine(
    (value) => {
      return dosageFrequency.some((item) => item.value === value);
    },
    {
      message: "Name must match a label in the medicationsList",
    },
  ),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

export const DeleteMedicationSchema = z.object({
  id: z.string().min(6, {
    message: "Minimum of 6 characters required",
  }),
});
