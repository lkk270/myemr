import * as z from "zod";
import { UserRole, UserType } from "@prisma/client";

export const SettingsSchema = z
  .object({
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
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
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
      message: "Password is required!",
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
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
  firstName: z.string().min(1, {
    message: "First name is required",
  }),
  lastName: z.string().min(1, {
    message: "Last name is required",
  }),
  userType: z.enum([UserType.PATIENT, UserType.PROVIDER]),
});

export const AccessPatientWithCodeSchema = z.object({
  code: z.string().min(1, {
    message: "Access code is required",
  }),
});
