import * as z from "zod";
import { medicationsList, medicationCategories, dosageUnits, dosageFrequency } from "../constants";

export const NewMedicationSchema = z.object({
  name: z.string().refine(
    (value) => {
      return medicationsList.some((item) => item.value === value);
    },
    {
      message: "Name must match a label in the medicationsList",
    },
  ),
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
  prescribedByName: z.string().min(6, {
    message: "Minimum of 6 characters required",
  }),
  category: z.string().refine(
    (value) => {
      return medicationCategories.some((item) => item.value === value);
    },
    {
      message: "Name must match a label in the medicationsList",
    },
  ),
  dosage: z
    .string()
    .min(1, {
      message: "Minimum of 1 character required",
    })
    .max(10, {
      message: "No more than of 10 characters allowed",
    }),
  dosageUnits: z.string().refine(
    (value) => {
      return dosageUnits.some((item) => item.value === value);
    },
    {
      message: "Name must match a label in the medicationsList",
    },
  ),
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

export const EditMedicationSchema = z.object({
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
  prescribedByName: z.string().min(6, {
    message: "Minimum of 6 characters required",
  }),
  category: z.string().refine(
    (value) => {
      return medicationCategories.some((item) => item.value === value);
    },
    {
      message: "Name must match a label in the medicationsList",
    },
  ),
  dosage: z
    .string()
    .min(1, {
      message: "Minimum of 1 character required",
    })
    .max(10, {
      message: "No more than of 10 characters allowed",
    }),
  dosageUnits: z.string().refine(
    (value) => {
      return dosageUnits.some((item) => item.value === value);
    },
    {
      message: "Name must match a label in the medicationsList",
    },
  ),
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
