import * as z from "zod";
import { UserRole, UserType } from "@prisma/client";

const nonEmptyString = z.string().min(6).or(z.literal(""));
const transformedString = nonEmptyString.transform((str) => (str === "" ? undefined : str));

export const SettingsSchema = z
  .object({
    name: z
      .string()
      .optional()
      .refine((value) => typeof value === "undefined" || (value.length > 1 && value.length <= 70), {
        message: "Name must be longer than 1 character and not exceed 70 characters.",
      }),

    isTwoFactorEnabled: z.optional(z.boolean()),
    userType: z.enum([UserType.PATIENT, UserType.PROVIDER]),
    role: z.enum([
      UserRole.USER,
      UserRole.ADMIN,
      UserRole.UPLOAD_FILES_ONLY,
      UserRole.READ_ONLY,
      UserRole.READ_AND_ADD,
      UserRole.FULL_ACCESS,
    ]),
    email: z.optional(z.string().email()),
    password: transformedString.optional(),
    newPassword: transformedString.optional(),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }

      return true;
    },
    {
      message: "New password is required!",
      path: ["newPassword"],
    },
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false;
      }

      return true;
    },
    {
      message: "Current password is required!",
      path: ["password"],
    },
  );

export const NewPasswordSchema = z.object({
  userType: z.enum([UserType.PATIENT, UserType.PROVIDER]),
  password: z.string().min(6, {
    message: "Minimum of 6 characters required",
  }),
});

export const ResetSchema = z.object({
  userType: z.enum([UserType.PATIENT, UserType.PROVIDER]),
  email: z.string().email({
    message: "Email is required",
  }),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  code: z.optional(z.string()),
  userType: z.enum([UserType.PATIENT, UserType.PROVIDER]),
});

export const RegisterSchema = z.object({
  email: z
    .string()
    .email({
      message: "Email is required",
    })
    .max(320, {
      message: "Minimum 320 characters required",
    }),
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
  firstName: z
    .string()
    .min(1, {
      message: "First name is required",
    })
    .max(35, {
      message: "Maximum 35 characters required",
    }),
  lastName: z
    .string()
    .min(1, {
      message: "Last name is required",
    })
    .max(35, {
      message: "Maximum 35 characters required",
    }),
  userType: z.enum([UserType.PATIENT, UserType.PROVIDER]),
});

export const AccessPatientWithCodeSchema = z.object({
  code: z.string().min(1, {
    message: "Access code is required",
  }),
});
