import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { dark } from "@clerk/themes";
import { ClerkProvider } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Emridoc",
	description: "A patient focused EMR",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider
			appearance={{
				baseTheme: dark,
				layout: {
					termsPageUrl: "https://clerk.com/terms",
				},
			}}
		>
			<html lang="en" suppressHydrationWarning>
				<body className={cn("bg-secondary/20", font.className)}>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
						storageKey="emridoc-theme"
					>
						{children}
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
