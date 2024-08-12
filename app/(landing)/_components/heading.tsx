"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/loading/spinner";
import { useSession } from "next-auth/react";
import { JoinDropdown } from "./join-dropdown";
export const Heading = () => {
  // const { isSignedIn, user, isLoaded } = useUser();
  const session = useSession();
  const sessionData = session.data;
  const user = sessionData?.user || null;

  ////          <Highlight className="text-black dark:text-white z-1">Welcome to MyEMR</Highlight>

  // const constantText = `But it doesn't. Instead, patients don't have direct democratized access to their medical records and are left
  // paralyzed when it comes to their care.`;
  return (
    <div className="flex flex-col gap-y-6 items-center">
      <div className="max-w-3xl space-y-4">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
          All your medical records in one place. Welcome to{" "}
          <span className="bg-gradient-to-r from-violet-400 to-[#4f5eff] bg-clip-text text-transparent">MyEMR</span>
        </h1>
        <h3 className="text-base sm:text-md md:text-xl font-medium">
          We make it easy to securely store and access your records, while also being able to share them with care
          providers and clinical trials of your choosing.
        </h3>

        {session.status === "loading" && (
          <div className="w-full flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}

        {session.status === "authenticated" && user && (
          <Button asChild>
            <Link href={`/${user.userType.toLowerCase()}-home`} onDragStart={(e) => e.preventDefault()}>
              Enter MyEMR
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </div>
      <JoinDropdown />
      <div className="text-center max-w-5xl space-y-4 flex flex-col gap-y-2">
        {/* <h1 className="text-center text-lg sm:text-2xl font-bold">
          {`The healthcare industry should put patients first...`}
        </h1> */}
        {/* <p className="text-sm hidden sm:flex sm:text-md font-medium"> */}
        {/* {constantText} */}
        {/* {`If you've ever been referred or have had to switch doctors you're familiar with the chaos of disorganized & missing records and wasteful repeated tests. MyEMR addresses this by consolidating all your most important records in one shareable location, simplifying your healthcare experience.`}
        </p> */}
        {/* <p className="text-sm sm:text-md flex sm:hidden font-medium">{constantText}</p> */}
      </div>
    </div>
  );
};
