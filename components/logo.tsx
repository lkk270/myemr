"use client";

import Link from "next/link";
import Image from "next/image";
import { useMediaQuery } from "usehooks-ts";

import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";

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
  const size = showText ? "40" : "30";
  return (
    <Link href="/" className={cn(showText ? "sm:w-32" : "")} onDragStart={(e) => e.preventDefault()}>
      <div className="flex items-center gap-x-2">
        <Image priority={true} src="/logo.svg" height={size} width={size} alt="Logo" draggable={false} />
        {showText && !isMobile && (
          <p className={cn("font-semibold text-sm sm:flex sm:text-lg", font.className, textColor && `text-primary/70`)}>
            MyEMR
          </p>
        )}
      </div>
    </Link>
  );
};
