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
  patientDynamicRoutes,
  providerRoutes,
  accessPatientRoutes,
  accessPatientDynamicRoutes,
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
  const nextUrlPathname = nextUrl.pathname;
  const isApiAuthRoute = nextUrlPathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrlPathname);
  const isAuthRoute = authRoutes.includes(nextUrlPathname);
  const isPatientRoute =
    patientRoutes.includes(nextUrlPathname) || patientDynamicRoutes.some((path) => nextUrlPathname.startsWith(path));
  const isProviderRoute = providerRoutes.includes(nextUrlPathname);
  const isAccessPatientRoute =
    accessPatientRoutes.includes(nextUrlPathname) ||
    accessPatientDynamicRoutes.some((path) => nextUrlPathname.startsWith(path));
  if (isApiAuthRoute) {
    return null;
  }

  const user = session?.user;

  let redirectUrl = "/";

  const userType = user?.userType;
  const userRole = user?.role;

  if (userType === "PATIENT" && userRole === "ADMIN") {
    redirectUrl = PATIENT_DEFAULT_LOGIN_REDIRECT;
  } else if (
    (userType === "PATIENT" && userRole === "FULL_ACCESS") ||
    userRole === "READ_AND_ADD" ||
    userRole === "READ_ONLY" ||
    userRole === "UPLOAD_FILES_ONLY"
  ) {
    redirectUrl = ACCESS_PATIENT_WITH_CODE_REDIRECT;
  } else if (userType === "PROVIDER") {
    redirectUrl = PROVIDER_DEFAULT_LOGIN_REDIRECT;
  }
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(redirectUrl, nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrlPathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    //TODO change to base-login
    return Response.redirect(new URL(`/auth/base-login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }
  if (isPatientRoute && isLoggedIn && (userType !== "PATIENT" || userRole !== "ADMIN")) {
    return Response.redirect(new URL(redirectUrl, nextUrl));
  }
  if (isProviderRoute && isLoggedIn && userType !== "PROVIDER") {
    return Response.redirect(new URL(redirectUrl, nextUrl));
  }

  if (
    isAccessPatientRoute &&
    isLoggedIn &&
    (userType !== "PATIENT" ||
      (userType === "PATIENT" &&
        userRole !== "FULL_ACCESS" &&
        userRole !== "UPLOAD_FILES_ONLY" &&
        userRole !== "READ_ONLY" &&
        userRole !== "READ_AND_ADD"))
  ) {
    return Response.redirect(new URL(redirectUrl, nextUrl));
  }

  // if (
  //   nextUrlPathname === "/" &&
  //   isLoggedIn &&
  //   (user?.role === "FULL_ACCESS" ||
  //     user?.role === "READ_ONLY" ||
  //     user?.role === "UPLOAD_FILES_ONLY" ||
  //     user?.role === "READ_AND_ADD")
  // ) {
  //   console.log(redirectUrl);
  //   return Response.redirect(new URL(ACCESS_PATIENT_WITH_CODE_REDIRECT, nextUrl));
  // } else

  if (nextUrlPathname === "/" && isLoggedIn) {
    return Response.redirect(new URL(redirectUrl, nextUrl));
  }
  // if (nextUrlPathname === "/" && isLoggedIn && user?.userType === "PATIENT" && user?.role === "ADMIN") {
  //   return Response.redirect(new URL(PATIENT_DEFAULT_LOGIN_REDIRECT, nextUrl));
  // } else if (nextUrlPathname === "/" && isLoggedIn && user?.userType === "PROVIDER") {
  //   return Response.redirect(new URL(PROVIDER_DEFAULT_LOGIN_REDIRECT, nextUrl));
  // }

  return null;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
