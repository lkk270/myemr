import NextAuth from "next-auth";
import { auth2 } from "@/auth";
import authConfig from "@/auth.config";
// import { extractCurrentUserPermissions } from "./auth/hooks/use-current-user-permissions";
import {
  PATIENT_DEFAULT_LOGIN_REDIRECT,
  PROVIDER_DEFAULT_LOGIN_REDIRECT,
  ACCESS_PATIENT_WITH_CODE_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  dynamicPublicRoutes,
  patientRoutes,
  patientDynamicRoutes,
  providerDynamicRoutes,
  providerRoutes,
  accessPatientRoutes,
  accessPatientDynamicRoutes,
  accessPatientUploadRoutes,
  // accessPatientApiRoutes,
  termRoutes,
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

  const dynamicPublicRoutesRegex = new RegExp(`^(?:${dynamicPublicRoutes.join("|")})[^/]+/?$`);
  const isDynamicPublicRoute = dynamicPublicRoutesRegex.test(nextUrlPathname);
  const isPublicRoute = publicRoutes.includes(nextUrlPathname) || isDynamicPublicRoute;
  const isTermRoute = termRoutes.includes(nextUrlPathname);
  const isAuthRoute = authRoutes.includes(nextUrlPathname);

  const patientDynamicRoutesRegex = new RegExp(`^(?:${patientDynamicRoutes.join("|")})[^/]+/?$`);
  const isPatientDynamicRoute = patientDynamicRoutesRegex.test(nextUrlPathname);
  const isPatientRoute = patientRoutes.includes(nextUrlPathname) || isPatientDynamicRoute;

  const isProviderRoute =
    providerRoutes.includes(nextUrlPathname) || providerDynamicRoutes.some((route) => nextUrlPathname.includes(route));

  const accessPatientDynamicRoutesRegex = new RegExp(`^(?:${accessPatientDynamicRoutes.join("|")})[^/]+/?$`);
  const isAccessPatientDynamicRoute = accessPatientDynamicRoutesRegex.test(nextUrlPathname);
  const isAccessPatientRoute = accessPatientRoutes.includes(nextUrlPathname) || isAccessPatientDynamicRoute;
  const isAccessPatientUploadRoutes = accessPatientUploadRoutes.includes(nextUrlPathname);

  // const isAccessPatientApiRoutes = accessPatientApiRoutes.includes(nextUrlPathname);
  const user = session?.user;

  // const currentUserPermissions = extractCurrentUserPermissions(user);
  // if (isLoggedIn) {
  //   console.log(currentUserPermissions.hasAccount);
  //   console.log(session?.expires);
  //   console.log(new Date(req.auth?.expires!!) < new Date());
  //   console.log("IN 57");
  // }

  // console.log("isPublicRoute", isPublicRoute);
  // console.log(nextUrlPathname);

  // console.log(nextUrl);
  // console.log(nextUrlPathname);
  // console.log("isAccessPatientApiRoutes", isAccessPatientApiRoutes);
  // console.log(isLoggedIn);

  if (isApiAuthRoute) {
    return;
  }

  // if (!isPublicRoute) {
  //   if (
  //     (isLoggedIn && !session?.expires) ||
  //     (isLoggedIn && !currentUserPermissions.hasAccount && new Date(session?.expires!!) < new Date())
  //   ) {
  //     console.log("IN 59");
  //     return Response.redirect("http://localhost:3000/");
  //   }
  // }

  // if (isAccessPatientApiRoutes) {
  //   console.log("IN 666");

  //   if (
  //     (isLoggedIn && !session?.expires) ||
  //     (isLoggedIn && !currentUserPermissions.hasAccount && new Date(session?.expires!!) < new Date())
  //   ) {
  //     console.log("IN 59");
  //     return Response.redirect(new URL("/", nextUrl));
  //   }
  // }

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
    return;
  }

  if (!isLoggedIn && !isPublicRoute && !isTermRoute) {
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
    userRole !== "UPLOAD_FILES_ONLY" &&
    (userType !== "PATIENT" ||
      (userType === "PATIENT" && userRole !== "FULL_ACCESS" && userRole !== "READ_ONLY" && userRole !== "READ_AND_ADD"))
  ) {
    return Response.redirect(new URL(redirectUrl, nextUrl));
  }
  //because /tpa-home is also included the above used accessPatientRoutes var it is already covered for unauthorized visits
  //this if restricts an UPLOAD_FILES_ONLY temp user to only their routes and not the other tpa routes
  if (
    nextUrlPathname !== "/tpa-home" &&
    isAccessPatientRoute &&
    isLoggedIn &&
    (userRole === "UPLOAD_FILES_ONLY" || userType !== "PATIENT")
  ) {
    return Response.redirect(new URL(redirectUrl, nextUrl));
  }

  if (
    nextUrlPathname !== "/tpa-home" &&
    isAccessPatientUploadRoutes &&
    isLoggedIn &&
    (userRole !== "UPLOAD_FILES_ONLY" || userType !== "PATIENT")
  ) {
    return Response.redirect(new URL(redirectUrl, nextUrl));
  }

  // if ((!!session && isAccessPatientUploadRoutes) || isAccessPatientUploadRoutes) {
  //   const code = await getAccessPatientCodeByToken(session?.tempToken);
  //   if (!code) {
  //     console.log("SCINANARA BITCH");
  //     await signOut({ redirect: true, redirectTo: "/" });
  //   }
  // }

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

  if (isPublicRoute && isLoggedIn && !isDynamicPublicRoute) {
    return Response.redirect(new URL(redirectUrl, nextUrl));
  }
  // if (nextUrlPathname === "/" && isLoggedIn && user?.userType === "PATIENT" && user?.role === "ADMIN") {
  //   return Response.redirect(new URL(PATIENT_DEFAULT_LOGIN_REDIRECT, nextUrl));
  // } else if (nextUrlPathname === "/" && isLoggedIn && user?.userType === "PROVIDER") {
  //   return Response.redirect(new URL(PROVIDER_DEFAULT_LOGIN_REDIRECT, nextUrl));
  // }

  return;
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
