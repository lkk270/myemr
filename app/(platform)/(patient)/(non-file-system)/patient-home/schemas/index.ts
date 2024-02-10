import * as z from "zod";
import { AccessCodeType, AccessCodeValidTime } from "@prisma/client";

export const GenerateCodeSchema = z.object({
  validFor: z.enum([
    AccessCodeValidTime.MINUTE_30,
    AccessCodeValidTime.HOUR_1,
    AccessCodeValidTime.HOUR_12,
    AccessCodeValidTime.DAY_1,
    AccessCodeValidTime.WEEK_1,
  ]),
  accessType: z.enum([
    AccessCodeType.UPLOAD_FILES_ONLY,
    AccessCodeType.READ_ONLY,
    AccessCodeType.READ_AND_ADD,
    AccessCodeType.FULL_ACCESS,
  ]),
});
