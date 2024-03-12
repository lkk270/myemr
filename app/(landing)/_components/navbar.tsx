"use client";

// import { useUser } from "@clerk/nextjs";
import { SignUpButton, UserButton } from "@clerk/clerk-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/loading/spinner";
import { cn } from "@/lib/utils";

import { Logo } from "@/components/logo";
import { AccessWithCodeButton } from "@/auth/components/auth/access-patient-with-code-button";
import { LoginButton } from "@/auth/components/auth/login-button";
import { useMediaQuery } from "usehooks-ts";
interface NavbarProps {
  scrolled: boolean;
}

export const Navbar = ({ scrolled }: NavbarProps) => {
  const isMobile = useMediaQuery("(max-width: 450px)");
  const session = useSession();
  const sessionData = session.data;
  const user = sessionData?.user || null;
  // console.log(sessionData);
  // console.log(sessionData?.user.role);
  // console.log(session);
  // console.log(user);
  // console.log(session.status);

  return (
    <div
      className={cn(
        "h-16 z-100 fixed top-0 flex items-center w-full p-2 sm:p-6",
        scrolled && !isMobile && "backdrop-blur",
        isMobile &&
          "dark:bg-[#1F1F1F] dark:from-[#232437] dark:via-[#232435] dark:to-[#1F1F1F]  bg-gradient-to-r from-[#dbd7fb] via-[#fbe2e3] to-[#f8f5f5] shadow-sm bg-muted",
      )}
    >
      <Logo />
      <div className="ml-auto justify-end w-full flex items-center gap-x-1 xs:gap-x-2">
        {(!user || session.status === "unauthenticated") && (
          <>
            <AccessWithCodeButton asChild>
              <Button variant="gooeyLeftGhost" size="sm">
                Have Code?
              </Button>
            </AccessWithCodeButton>
            <LoginButton mode="modal" asChild userType="PATIENT">
              <Button variant="gooeyLeftGhost" size="sm">
                Patient
              </Button>
            </LoginButton>
            <LoginButton mode="modal" asChild userType="PROVIDER">
              <Button variant="gooeyLeftGhost" size="sm">
                Provider
              </Button>
            </LoginButton>
          </>
        )}
        {session.status === "loading" && <Spinner />}
        {/* {user &&
          session.status === "authenticated" &&
          sessionData?.user.userType === "PATIENT" &&
          sessionData?.user.role === "ADMIN" && <>{redirect(`/${user.userType.toLowerCase()}-home`)}</>} */}
        {/* {!isSignedIn && isLoaded && (
          <>
            <LoginButton asChild>
              <Button variant="secondary" size="lg">
                Sign in
              </Button>
            </LoginButton>
            <SignUpButton mode="modal" redirectUrl="/patient-home" unsafeMetadata={{ userType: "patient" }}>
              <Button variant="ghost" size="sm" className="font-semibold border">
                Patient
              </Button>
            </SignUpButton>
            <SignUpButton mode="modal" redirectUrl="/provider-home" unsafeMetadata={{ userType: "provider" }}>
              <Button variant="ghost" size="sm" className="font-semibold border">
                Provider
              </Button>
            </SignUpButton>
          </>
        )}
        {isSignedIn && isLoaded && (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/${user.unsafeMetadata.userType}-home`}>Enter MyEMR</Link>
            </Button>
            {redirect(`/${user.unsafeMetadata.userType}-home`)}
            <UserButton afterSignOutUrl="/" />
          </>
        )} */}
        <div className="hidden sm:flex">
          <ModeToggle />
        </div>
      </div>
    </div>
  );
};
