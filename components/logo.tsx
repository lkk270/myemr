"use client";

import Link from "next/link";
import Image from "next/image";
import { useMediaQuery } from "usehooks-ts";

import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { planNames } from "@/lib/constants";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
});

interface LogoProps {
  textColor?: string;
  showText?: boolean;
}

export const Logo = ({ textColor, showText = true }: LogoProps) => {
  const isMobile = useMediaQuery("(max-width: 500px)");
  const currentUser = useCurrentUser();
  const currentUserPermissions = extractCurrentUserPermissions(currentUser);
  const plan = currentUser?.plan;
  const size = showText ? "40" : "30";
  return (
    <Link href="/" className={cn(showText ? "sm:w-32" : "")} onDragStart={(e) => e.preventDefault()}>
      <div className="flex items-center gap-x-2">
        <Image
          className="shrink-0"
          priority={true}
          src="/logo.svg"
          height={size}
          width={size}
          alt="Logo"
          draggable={false}
        />
        {showText && !isMobile && (
          <p
            className={cn(
              "font-semibold text-sm sm:flex sm:text-lg gap-x-2",
              font.className,
              textColor && `text-primary/70`,
            )}
          >
            MyEMR
            {!!plan && !plan.includes("FREE") && currentUserPermissions.hasAccount && (
              <span className="bg-gradient-to-r from-violet-400 to-[#4f5eff] bg-clip-text text-transparent">
                {planNames[plan].title}
              </span>
            )}
          </p>
        )}
      </div>
    </Link>
  );
};
