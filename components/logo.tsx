"use client";

import Link from "next/link";
import Image from "next/image";

import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";

const font = Poppins({
	subsets: ["latin"],
	weight: ["400", "600"],
});

interface LogoProps {
	textColor?: string;
}

export const Logo = ({ textColor }: LogoProps) => {
	return (
		<Link href="/">
			<div className="flex items-center gap-x-2">
				<Image src="/logo.svg" height="40" width="40" alt="Logo" draggable={false} />
				<p className={cn("font-semibold text-sm sm:flex sm:text-lg", font.className, textColor && `text-primary/70`)}>
					Emridoc
				</p>
			</div>
		</Link>
	);
};
