import * as z from "zod";

export const StipePostSchema = z.object({
  redirectUrl: z.string().refine(
    (url) => {
      // List of static paths
      const staticPaths = ["/patient-home", "/medications", "/files", "/about", "/providers"];

      // Check if the url is one of the static paths
      if (staticPaths.includes(url)) return true;

      // Check for dynamic "/files/[id]" or "/file/[id]" paths
      if (/^\/files\/[a-zA-Z0-9]+$/.test(url)) return true;
      if (/^\/file\/[a-zA-Z0-9]+$/.test(url)) return true;

      // If none of the conditions match, the url is not valid
      return false;
    },
    {
      // Custom error message
      message: "Invalid redirect URL. URL must be one of the predefined paths or match '/files/[id]' or '/file/[id]'.",
    },
  ),
  plan: z.enum(["PATIENT_PREMIUM_1", "PATIENT_PREMIUM_2", "PROVIDER_PREMIUM_1", "PROVIDER_PREMIUM_2"]),
});
