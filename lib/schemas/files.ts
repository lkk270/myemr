import { InsuranceSide } from "@prisma/client";
import * as z from "zod";

export const RenameNodeSchema = z.object({
  nodeId: z.string().min(6, {
    message: "Minimum nodeId text not met",
  }),
  isFile: z.boolean(),
  newName: z
    .string()
    .min(1, {
      message: "Minimum newName text not met",
    })
    .refine((value) => !/[\/\\?%*:|"<>]/g.test(value), {
      message: "newName contains invalid characters",
    }),
});

export const MoveNodeSchema = z.object({
  selectedIds: z.object({
    selectedIds: z.array(z.string().min(6, "Each ID must be at least 6 characters long")),
  }),
  targetId: z.string().min(6, {
    message: "Minimum targetId text not met",
  }),
  fromName: z
    .string()
    .min(1, {
      message: "Minimum fromName text not met",
    })
    .refine((value) => !/[\/\\?%*:|"<>]/g.test(value), {
      message: "fromName contains invalid characters",
    }),
  toName: z
    .string()
    .min(1, {
      message: "Minimum toName text not met",
    })
    .refine((value) => !/[\/\\?%*:|"<>]/g.test(value), {
      message: "toName contains invalid characters",
    }),
});

export const TrashNodeSchema = z.object({
  selectedIds: z.object({
    selectedIds: z.array(z.string().min(6, "Each ID must be at least 6 characters long")),
  }),
  targetId: z.string().min(6, {
    message: "Minimum targetId text not met",
  }),
});

export const RestoreRootNodeSchema = z.object({
  selectedId: z.string().min(6, {
    message: "Minimum selectedId text not met",
  }),
});

export const DeleteNodeSchema = z.object({
  selectedIds: z.object({
    selectedIds: z.array(z.string().min(6, "Each ID must be at least 6 characters long")),
  }),
  forEmptyTrash: z.boolean(),
});

export const AddRootNodeSchema = z.object({
  folderName: z.string().min(1, {
    message: "Minimum folderName text not met",
  }),
  addedByUserId: z.string().min(6, {
    message: "Minimum addedByUserId text not met",
  }),
  patientUserId: z.string().min(6, {
    message: "Minimum patientUserId text not met",
  }),
  addedByName: z.string().min(1, {
    message: "Minimum addedByName text not met",
  }),
  patientProfileId: z
    .string()
    .optional()
    .refine(
      (value) => {
        return value === undefined || value.length >= 6;
      },
      {
        message: "Minimum patientProfileId text not met",
      },
    ),
});

export const AddSubFolderSchema = z.object({
  parentId: z.string().min(6, {
    message: "Minimum parentId text not met",
  }),
  folderName: z.string().min(1, {
    message: "Minimum folderName text not met",
  }),
  addedByUserId: z.string().min(6, {
    message: "Minimum addedByUserId text not met",
  }),
  patientUserId: z.string().min(6, {
    message: "Minimum patientUserId text not met",
  }),
  addedByName: z.string().min(1, {
    message: "Minimum addedByName text not met",
  }),
  patientProfileId: z
    .string()
    .optional()
    .refine(
      (value) => {
        return value === undefined || value.length >= 6;
      },
      {
        message: "Minimum patientProfileId text not met",
      },
    ),
});

export const UploadFilesSchema = z.object({
  fileName: z.string().min(1, {
    message: "Minimum fileName text not met",
  }),
  contentType: z.string().min(1, {
    message: "Minimum contentType text not met",
  }),
  size: z.bigint(),
  parentId: z.string().min(6, {
    message: "Minimum parentId text not met",
  }),
  parentNamePath: z.string().min(1, {
    message: "Minimum addedByName text not met",
  }),
  parentPath: z.string().min(1, {
    message: "Minimum addedByName text not met",
  }),
  folderPath: z
    .string()
    .optional()
    .refine(
      (value) => {
        return value === undefined || value.length >= 1;
      },
      {
        message: "Minimum addedByName text not met",
      },
    ),
});

export const InsuranceUploadSchema = z.object({
  side: z.enum([InsuranceSide.FRONT, InsuranceSide.BACK]),
  contentType: z.string().min(1, {
    message: "Minimum contentType text not met",
  }),
  size: z.bigint(),
});

export const TpaUploadFilesSchema = z.object({
  fileName: z.string().min(1, {
    message: "Minimum fileName text not met",
  }),
  contentType: z.string().min(1, {
    message: "Minimum contentType text not met",
  }),
  size: z.bigint(),
});

export const RrUploadFilesSchema = z.object({
  fileName: z.string().min(1, {
    message: "Minimum fileName text not met",
  }),
  contentType: z.string().min(1, {
    message: "Minimum contentType text not met",
  }),
  size: z.bigint(),
  accessToken: z.string().min(6, {
    message: "Minimum accessToken text not met",
  }),
});

export const PpUploadFilesSchema = z.object({
  contentType: z.string().min(1, {
    message: "Minimum contentType text not met",
  }),
});
