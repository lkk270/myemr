import { NotificationType, OrganizationMemberRole, UserRole } from "@prisma/client";
import * as z from "zod";
import { medicationsList, rootFolderCategories } from "../constants";

const AddedToOrganizationSchema = z.object({
  organizationName: z.string(),
  role: z.enum([OrganizationMemberRole.ADMIN, OrganizationMemberRole.OWNER, OrganizationMemberRole.USER]),
});
const AccessCodeFileRenamedSchema = z.object({
  isFile: z.boolean(),
  role: z.enum([UserRole.READ_AND_ADD, UserRole.FULL_ACCESS]),
  oldName: z.string(),
  newName: z.string(),
});
const AccessCodeNodeMovedSchema = z.object({
  numOfNodes: z.number().min(1),
  role: z.enum([UserRole.READ_AND_ADD, UserRole.FULL_ACCESS]),
  fromFolder: z.string(),
  toFolder: z.string(),
});
const AccessCodeAddedRootFolderSchema = z.object({
  role: z.enum([UserRole.READ_AND_ADD, UserRole.FULL_ACCESS]),
  rootFolderName: z.string().refine(
    (value) => {
      return rootFolderCategories.some((item) => item.value === value);
    },
    {
      message: "Name must match a value in the rootFolderCategories",
    },
  ),
});
const AccessCodeAddedSubFolderSchema = z.object({
  role: z.enum([UserRole.READ_AND_ADD, UserRole.FULL_ACCESS]),
  subFolderName: z.string().min(1),
});
const AccessCodeFileUploadedSchema = z.object({
  numOfFiles: z.number().min(1),
  role: z.enum([UserRole.UPLOAD_FILES_ONLY, UserRole.READ_AND_ADD, UserRole.FULL_ACCESS]),
});
const AccessCodeMedicationSchema = z.object({
  medicationName: z.string().refine(
    (value) => {
      return medicationsList.some((item) => item.value === value);
    },
    {
      message: "Name must match a value in the medicationsList",
    },
  ),
  role: z.enum([UserRole.READ_AND_ADD, UserRole.FULL_ACCESS]),
});

const ProviderFileRenamedSchema = AccessCodeFileRenamedSchema.merge(
  z.object({
    organizationName: z.string(),
  }),
);
const ProviderNodeMovedSchema = AccessCodeNodeMovedSchema.merge(
  z.object({
    organizationName: z.string(),
  }),
);
const ProviderAddedRootFolderSchema = AccessCodeAddedRootFolderSchema.merge(
  z.object({
    organizationName: z.string(),
  }),
);

const ProviderAddedSubFolderSchema = AccessCodeAddedSubFolderSchema.merge(
  z.object({
    organizationName: z.string(),
  }),
);

const ProviderFileUploadedSchema = AccessCodeFileUploadedSchema.merge(
  z.object({
    organizationName: z.string(),
  }),
);

const ProviderMedicationSchema = AccessCodeMedicationSchema.merge(
  z.object({
    organizationName: z.string(),
  }),
);

const RequestRecordsFileUploadSchema = z.object({
  requestRecordsCodeToken: z.string().min(1, {
    message: "Minimum requestRecordsCodeToken length not met ",
  }),
  email: z.string().email().max(320, {
    message: "Minimum 320 characters required",
  }),
  numOfFiles: z.number().min(1),
});

// Define a base schema for common fields
const NotificationPostSchema = z
  .object({
    patientUserId: z.string().optional().nullable(),
    notificationType: z.enum([
      NotificationType.ADDED_TO_ORGANIZATION,
      NotificationType.ACCESS_CODE_NODE_RENAMED,
      NotificationType.ACCESS_CODE_NODE_MOVED,
      NotificationType.ACCESS_CODE_FILE_UPLOADED,
      NotificationType.ACCESS_CODE_ADDED_ROOT_FOLDER,
      NotificationType.ACCESS_CODE_ADDED_SUB_FOLDER,
      NotificationType.ACCESS_CODE_MEDICATION_ADDED,
      NotificationType.ACCESS_CODE_MEDICATION_EDITED,
      NotificationType.PROVIDER_NODE_RENAMED,
      NotificationType.PROVIDER_NODE_MOVED,
      NotificationType.PROVIDER_FILE_UPLOADED,
      NotificationType.PROVIDER_ADDED_ROOT_FOLDER,
      NotificationType.PROVIDER_ADDED_SUB_FOLDER,
      NotificationType.PROVIDER_MEDICATION_ADDED,
      NotificationType.PROVIDER_MEDICATION_EDITED,
      NotificationType.REQUEST_RECORDS_FILE_UPLOAD,
    ]),
    dynamicData: z.any(), // Temporarily set to `any`, will refine based on the type
  })
  .superRefine((obj, ctx) => {
    let schema;
    switch (obj.notificationType) {
      case "ADDED_TO_ORGANIZATION":
        schema = AddedToOrganizationSchema;
        break;
      case "ACCESS_CODE_NODE_RENAMED":
        schema = AccessCodeFileRenamedSchema;
        break;
      case "ACCESS_CODE_NODE_MOVED":
        schema = AccessCodeNodeMovedSchema;
        break;
      case "ACCESS_CODE_ADDED_ROOT_FOLDER":
        schema = AccessCodeAddedRootFolderSchema;
        break;
      case "ACCESS_CODE_ADDED_SUB_FOLDER":
        schema = AccessCodeAddedSubFolderSchema;
        break;
      case "ACCESS_CODE_FILE_UPLOADED":
        schema = AccessCodeFileUploadedSchema;
        break;
      case "ACCESS_CODE_MEDICATION_ADDED":
        schema = AccessCodeMedicationSchema;
        break;
      case "ACCESS_CODE_MEDICATION_EDITED":
        schema = AccessCodeMedicationSchema;
        break;
      case "PROVIDER_NODE_RENAMED":
        schema = ProviderFileRenamedSchema;
        break;
      case "PROVIDER_NODE_MOVED":
        schema = ProviderNodeMovedSchema;
        break;
      case "PROVIDER_ADDED_ROOT_FOLDER":
        schema = ProviderAddedRootFolderSchema;
        break;
      case "PROVIDER_ADDED_SUB_FOLDER":
        schema = ProviderAddedSubFolderSchema;
        break;
      case "PROVIDER_FILE_UPLOADED":
        schema = ProviderFileUploadedSchema;
        break;
      case "PROVIDER_MEDICATION_ADDED":
        schema = ProviderMedicationSchema;
        break;
      case "PROVIDER_MEDICATION_EDITED":
        schema = ProviderMedicationSchema;
        break;
      case "REQUEST_RECORDS_FILE_UPLOAD":
        schema = RequestRecordsFileUploadSchema;
        break;
      // Define cases for other types similarly...
      default:
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid notification type",
        });
        return;
    }
    const result = schema.safeParse(obj.dynamicData);
    if (!result.success) {
      result.error.issues.forEach((issue) => ctx.addIssue(issue));
    }
  });

// const NotificationPostSchema = z.object({
//   notificationType: z.enum([
//     NotificationType.ADDED_TO_ORGANIZATION,
//     NotificationType.ACCESS_CODE_NODE_RENAMED,
//     NotificationType.ACCESS_CODE_FILE_UPLOADED,
//     NotificationType.ACCESS_CODE_MEDICATION_ADDED,
//     NotificationType.ACCESS_CODE_MEDICATION_EDITED,
//     NotificationType.REQUEST_RECORDS_FILE_UPLOAD,
//   ]),
//   dynamicData: DynamicDataSchema,
// });

// Schema for when type is REQUEST_RECORDS_UPLOAD that extends the base schema
// const RequestRecordsUploadSchema = BaseNotificationSchema.extend({
//   type: z.literal("REQUEST_RECORDS_UPLOAD"),
//   requestRecordsCodeToken: z.string().min(1, {
//     message: "Minimum requestRecordsCodeToken length not met ",
//   }),
// });

// // Schema for when type is ACCESS_CODE (or any other type that doesn't require requestRecordsCodeToken)
// const AccessCodeSchema = BaseNotificationSchema.extend({
//   type: z.literal("ACCESS_CODE"),
//   // Make requestRecordsCodeToken optional or omit it entirely if it shouldn't be present for this type
//   requestRecordsCodeToken: z
//     .string()
//     .min(1, {
//       message: "Minimum requestRecordsCodeToken length not met ",
//     })
//     .optional(),
// });

// const NotificationPostSchema = z.union([RequestRecordsUploadSchema, AccessCodeSchema]);

export { NotificationPostSchema };
