"use client";

import { useUser } from "@clerk/nextjs";
import { SignUpButton, UserButton } from "@clerk/clerk-react";
import Link from "next/link";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";

import { Logo } from "@/components/logo";

export const Navbar = () => {
	const { isSignedIn, isLoaded } = useUser();
	const scrolled = useScrollTop();

	return (
		<div
			className={cn(
				"z-100 bg-[#f5f5f4] dark:bg-[#1F1F1F] fixed top-0 flex items-center w-full p-2 sm:p-6",
				scrolled && "border-b shadow-sm",
			)}
		>
			<Logo />
			<div className="ml-auto justify-end w-full flex items-center gap-x-2">
				{!isLoaded && <Spinner />}
				{!isSignedIn && isLoaded && (
					<>
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
							<Link href="/home">Enter Emridoc</Link>
						</Button>
						{(window.location.href = "/home")}
						<UserButton afterSignOutUrl="/" />
					</>
				)}
				<div className="hidden sm:flex">
					<ModeToggle />
				</div>
			</div>
		</div>
	);
};
