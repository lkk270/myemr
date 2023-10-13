"use client";

import Link from "next/link";
import Image from "next/image";

import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";

const font = Poppins({
	subsets: ["latin"],
	weight: ["400", "600"],
});

export const Logo = () => {
	return (
		<Link href="/">
			<div className="flex items-center gap-x-2">
				<Image src="/logo.svg" height="40" width="40" alt="Logo" draggable={false} />
				<p className={cn("font-semibold", font.className)}>Emridoc</p>
			</div>
		</Link>
	);
};
