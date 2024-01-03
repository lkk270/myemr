/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ["/", "/auth/patient-new-verification", "/auth/provider-new-verification"];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to their respective home page
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/base-login",
  "/auth/patient-login",
  "/auth/provider-login",
  "/auth/patient-register",
  "/auth/provider-register",
  "/auth/error",
  "/auth/patient-reset",
  "/auth/provider-reset",
  "/auth/patient-new-password",
  "/auth/provider-new-password",
];

/**
 * An array of routes that are patient specific
 * @type {string[]}
 */
export const patientRoutes = [
  "/patient-home",
  "/files",
  "/about",
  "/meds",
  "/notes",
  "/providers",
  "/patient-settings",
];

/**
 * An array of routes that are provider specific
 * @type {string[]}
 */
export const providerRoutes = ["/provider-home", "/patients", "/provider-settings", "/organization"];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const PATIENT_DEFAULT_LOGIN_REDIRECT = "/patient-home";
export const PROVIDER_DEFAULT_LOGIN_REDIRECT = "/provider-home";
