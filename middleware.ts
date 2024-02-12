import NextAuth from "next-auth";
import { auth2 } from "@/auth";
import authConfig from "@/auth.config";
import {
  PATIENT_DEFAULT_LOGIN_REDIRECT,
  PROVIDER_DEFAULT_LOGIN_REDIRECT,
  ACCESS_PATIENT_WITH_CODE_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  patientRoutes,
  providerRoutes,
  accessPatientRoutes,
} from "@/routes";

const { auth } = NextAuth(authConfig);
export default auth(async (req) => {
  const { nextUrl } = req;

  const isLoggedIn = !!req.auth;
  // console.log(req.auth);
  // console.log("isLoggedIn", isLoggedIn);

  const session = await auth2();
  // console.log("IN 24");
  // console.log(session);
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isPatientRoute = patientRoutes.includes(nextUrl.pathname);
  const isProviderRoute = providerRoutes.includes(nextUrl.pathname);
  const isAccessPatientRoute = accessPatientRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return null;
  }

  const user = session?.user;

  const redirectUrl =
    user?.userType === "PATIENT"
      ? PATIENT_DEFAULT_LOGIN_REDIRECT
      : user?.userType === "PROVIDER"
      ? PROVIDER_DEFAULT_LOGIN_REDIRECT
      : ACCESS_PATIENT_WITH_CODE_REDIRECT;
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(redirectUrl, nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    //TODO change to base-login
    return Response.redirect(new URL(`/auth/base-login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }
  if (isPatientRoute && isLoggedIn && (user?.userType !== "PATIENT" || user?.role !== "ADMIN")) {
    // console.log("IN 66");
    // console.log(redirectUrl);
    // console.log(nextUrl);
    return Response.redirect(new URL("/access-home", nextUrl));
  }
  if (isProviderRoute && isLoggedIn && user?.userType !== "PROVIDER") {
    return Response.redirect(new URL(redirectUrl, nextUrl));
  }

  if (isAccessPatientRoute && isLoggedIn && user?.userType !== "PATIENT" && user?.userType !== "PROVIDER") {
    return Response.redirect(new URL(redirectUrl, nextUrl));
  }

  return null;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
