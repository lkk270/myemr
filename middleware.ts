import NextAuth from "next-auth";

import { auth2 } from "@/auth";
import authConfig from "@/auth.config";
import {
  PATIENT_DEFAULT_LOGIN_REDIRECT,
  PROVIDER_DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  patientRoutes,
  providerRoutes,
} from "@/routes";
import { UserType } from "@prisma/client";

const { auth } = NextAuth(authConfig);
export default auth(async (req) => {
  const { nextUrl } = req;

  const isLoggedIn = !!req.auth;

  const session = await auth2();

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isPatientRoute = patientRoutes.includes(nextUrl.pathname);
  const isProviderRoute = providerRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute || !session || !session.user.userType) {
    return null;
  }
  const user = session.user;

  const redirectUrl =
    user.userType === UserType.PATIENT ? PATIENT_DEFAULT_LOGIN_REDIRECT : PROVIDER_DEFAULT_LOGIN_REDIRECT;
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
    return Response.redirect(new URL(`/auth/patient-login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }
  if (isPatientRoute && isLoggedIn && user.userType !== UserType.PATIENT) {
    return Response.redirect(new URL(redirectUrl, nextUrl));
  }
  if (isProviderRoute && isLoggedIn && user.userType !== UserType.PROVIDER) {
    return Response.redirect(new URL(redirectUrl, nextUrl));
  }

  return null;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
