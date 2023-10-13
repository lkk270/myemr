"use client";

import { useUser } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";

export const Heading = () => {
	const { isSignedIn, user, isLoaded } = useUser();

	return (
		<div className="max-w-3xl space-y-4">
			<h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
				All your medical records in one place. Welcome to{" "}
				<span className="bg-gradient-to-r from-violet-400 to-[#4f5eff] bg-clip-text text-transparent">Emridoc</span>
			</h1>
			<h3 className="text-base sm:text-md md:text-xl font-medium">
				We makes it easy to collect, store, and access your records, while also being able to share them with care
				providers and clinical trials of your choosing.
			</h3>
			{!isLoaded && (
				<div className="w-full flex items-center justify-center">
					<Spinner size="lg" />
				</div>
			)}
			{isSignedIn && user && isLoaded && (
				<Button asChild>
					<Link href="/documents">
						Enter Emridoc
						<ArrowRight className="h-4 w-4 ml-2" />
					</Link>
				</Button>
			)}
			{!isSignedIn && isLoaded && (
				<SignInButton mode="modal">
					<Button>
						Join Emridoc
						<ArrowRight className="h-4 w-4 ml-2" />
					</Button>
				</SignInButton>
			)}
		</div>
	);
};
