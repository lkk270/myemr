import * as z from "zod";
import { states } from "../constants";

export const AddressSchema = z
  .object({
    address: z.string().optional().nullable(),
    address2: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z
      .string()
      .optional()
      .nullable()
      .refine(
        (value) => {
          // Skip refinement if value is null, undefined, or empty
          if (value === null || value === "" || value === undefined) return true;

          // Perform validation against states array
          return states.some((item) => item.value === value);
        },
        {
          message: "State must match a value in the states list, be null, or be an empty string",
        },
      ),

    zipcode: z
      .string()
      .optional()
      .nullable()
      .refine(
        (value) => {
          // Skip refinement if value is null, undefined, or empty
          if (value === null || value === "" || value === undefined) return true;

          // Perform regex validation for zip code
          return /^(\d{5})(-\d{4})?$/.test(value);
        },
        {
          message: "Zip code must be valid, null, or an empty string",
        },
      ),
  })
  .superRefine((data, ctx) => {
    const { address, city, state, zipcode } = data;
    const fillStates = [!address?.trim(), !city?.trim(), !state?.trim(), !zipcode?.trim()];
    const allFilled = fillStates.every((state) => state === true);
    const allUnfilled = fillStates.every((state) => state === false);

    // If not all filled and not all unfilled, then it's a partial entry which is not allowed
    if (!allFilled && !allUnfilled) {
      // Add an issue for each field that violates the rule
      ["address", "city", "state", "zipcode"].forEach((fieldName, index) => {
        if (fillStates[index]) {
          // If the field is not filled, flag it
          ctx.addIssue({
            path: [fieldName],
            message: "Either all or none of the address fields (except address2) must be filled",
            code: "custom",
          });
        }
      });
    }
  });
