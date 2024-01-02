"use client";

// import { useUser } from "@clerk/nextjs";
import { SignUpButton, UserButton } from "@clerk/clerk-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";

import { Logo } from "@/components/logo";
import { LoginButton } from "@/auth/components/auth/login-button";

interface NavbarProps {
  scrolled: boolean;
}

export const Navbar = ({ scrolled }: NavbarProps) => {
  const session = useSession();
  const sessionData = session.data;
  const user = sessionData?.user || null;

  return (
    <div
      className={cn(
        "dark:bg-[#161515] bg-[#fdfdfc] z-100 fixed top-0 flex items-center w-full p-2 sm:p-6",
        scrolled && "border-b shadow-sm",
      )}
    >
      <Logo />
      <div className="ml-auto justify-end w-full flex items-center gap-x-2">
        {(!user || session.status === "unauthenticated") && (
          <>
            <LoginButton mode="modal" asChild userType="PATIENT">
              <Button variant="ghost" size="sm">
                Patient
              </Button>
            </LoginButton>
            <LoginButton mode="modal" asChild userType="PROVIDER">
              <Button variant="ghost" size="sm">
                Provider
              </Button>
            </LoginButton>
          </>
        )}
        {session.status === "loading" && <Spinner />}
        {user && session.status === "authenticated" && <>{redirect(`/${user.userType.toLowerCase()}-home`)}</>}
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
              <Link href={`/${user.unsafeMetadata.userType}-home`}>Enter Emridoc</Link>
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
