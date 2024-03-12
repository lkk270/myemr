import * as z from "zod";

// Define a base schema for common fields
const BaseNotificationSchema = z.object({
  text: z.string().min(1, {
    message: "Minimum notification text not met ",
  }),
  type: z.enum(["ACCESS_CODE", "REQUEST_RECORDS_UPLOAD"]),
});

// Schema for when type is REQUEST_RECORDS_UPLOAD that extends the base schema
const RequestRecordsUploadSchema = BaseNotificationSchema.extend({
  type: z.literal("REQUEST_RECORDS_UPLOAD"),
  requestRecordsCodeToken: z.string().min(1, {
    message: "Minimum requestRecordsCodeToken length not met ",
  }),
});

// Schema for when type is ACCESS_CODE (or any other type that doesn't require requestRecordsCodeToken)
const AccessCodeSchema = BaseNotificationSchema.extend({
  type: z.literal("ACCESS_CODE"),
  // Make requestRecordsCodeToken optional or omit it entirely if it shouldn't be present for this type
  requestRecordsCodeToken: z
    .string()
    .min(1, {
      message: "Minimum requestRecordsCodeToken length not met ",
    })
    .optional(),
});

const NotificationPostSchema = z.union([RequestRecordsUploadSchema, AccessCodeSchema]);

export { NotificationPostSchema };
