"use client";

// import { useUser } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
// import { SignUpButton } from "@clerk/clerk-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { useSession } from "next-auth/react";
import { LoginButton } from "@/auth/components/auth/login-button";

export const Heading = () => {
  // const { isSignedIn, user, isLoaded } = useUser();
  const session = useSession();
  const user = session.data;
  console.log(user);
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
        All your medical records in one place. Welcome to{" "}
        <span className="bg-gradient-to-r from-violet-400 to-[#4f5eff] bg-clip-text text-transparent">Emridoc</span>
      </h1>
      <h3 className="text-base sm:text-md md:text-xl font-medium">
        We makes it easy to securely store and access your records, while also being able to share them with care
        providers and clinical trials of your choosing.
      </h3>
      {/* {!isLoaded && (
        <div className="w-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )} */}
      {/* {isSignedIn && user && isLoaded && (
        <Button asChild>
          <Link href={`/${user.unsafeMetadata.userType}-home`}>
            Enter Emridoc
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      )} */}
      {!user && (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default">
                Join Emridoc
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <LoginButton mode="modal" asChild userType="PATIENT">
                <Button variant="secondary" size="lg">
                  Patient
                </Button>
              </LoginButton>
              <LoginButton mode="modal" asChild userType="PROVIDER">
                <Button variant="secondary" size="lg">
                  Provider
                </Button>
              </LoginButton>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};
