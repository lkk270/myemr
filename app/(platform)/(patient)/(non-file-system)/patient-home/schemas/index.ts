import * as z from "zod";
import { AccessCodeValidTime, UserRole } from "@prisma/client";

export const GenerateCodeSchema = z.object({
  validFor: z.enum([
    AccessCodeValidTime.MINUTE_30,
    AccessCodeValidTime.HOUR_1,
    AccessCodeValidTime.HOUR_12,
    AccessCodeValidTime.DAY_1,
    AccessCodeValidTime.WEEK_1,
  ]),
  accessType: z.enum([UserRole.UPLOAD_FILES_ONLY, UserRole.READ_ONLY, UserRole.READ_AND_ADD, UserRole.FULL_ACCESS]),
  uploadToId: z.string(),
});

export const RequestRecordsSchema = z.object({
  providerEmail: z.string().email({
    message: "Provider email is required",
  }),
  uploadToId: z.string().min(1, {
    message: "upload folder is required.",
  }),
  signature: z.string().min(1, {
    message: "signature is required.",
  }),
});
