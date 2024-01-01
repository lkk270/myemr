/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ["/", "/auth/patient-new-verification", "/auth/provider-new-verification"];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /home
 * @type {string[]}
 */
export const authRoutes = [
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
