/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes: string[] = [
  "/",
  "/auth/patient-new-verification",
  "/auth/provider-new-verification",
  "/api/rr-file-upload",
  "/api/webhook",
  "/api/cron",
];

/**
 * An array of dynamic routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const dynamicPublicRoutes: string[] = ["/upload-records/"];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to their respective home page
 * @type {string[]}
 */
export const authRoutes: string[] = [
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
export const patientRoutes: string[] = ["/patient-home", "/files", "/about", "/medications", "/providers"];

/**
 * An array of routes that are patient specific and are dynamic
 * @type {string[]}
 */
export const patientDynamicRoutes: string[] = ["/files/", "/file/"];

/**
 * An array of routes that are provider specific
 * @type {string[]}
 */
export const providerRoutes: string[] = ["/provider-home", "/patients", "/provider-settings", "/organization"];

/**
 * An array of routes that are patient access specific
 * @type {string[]}
 */
export const accessPatientRoutes: string[] = ["/tpa-home", "/tpa-about", "/tpa-files", "/tpa-medications"];

/**
 * An array of routes that are patient access specific and are dynamic
 * @type {string[]}
 */
export const accessPatientDynamicRoutes: string[] = ["/tpa-files/", "/tpa-file/"];

/**
 * An array of routes that are patient access for upload specific
 * @type {string[]}
 */
export const accessPatientUploadRoutes: string[] = ["/tpa-home", "/tpa-upload"];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix: string = "/api/auth";

/**
 * An array of API routes that are patient access
 * @type {string[]}
 */
export const accessPatientApiRoutes: string[] = ["/api/patient-update", "/api/tpa-file-upload"];

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const PATIENT_DEFAULT_LOGIN_REDIRECT: string = "/patient-home";
export const PROVIDER_DEFAULT_LOGIN_REDIRECT: string = "/provider-home";
export const ACCESS_PATIENT_WITH_CODE_REDIRECT: string = "/tpa-home";
