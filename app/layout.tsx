import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { dark } from "@clerk/themes";
// import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

import NextTopLoader from "nextjs-toploader";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";

import { NewMedicationModal } from "./(platform)/(patient)/(non-file-system)/medications/_components/modals/new-medication-modal";
import { ViewMedicationModal } from "./(platform)/(patient)/(non-file-system)/medications/_components/modals/view-medication-modal";
import TopLoader from "@/components/top-loader";

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Emridoc",
  description: "A patient focused EMR",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    // <ClerkProvider
    //   appearance={{
    //     baseTheme: dark,
    //     layout: {
    //       termsPageUrl: "https://clerk.com/terms",
    //     },
    //   }}
    // >
    <SessionProvider session={session}>
      <html lang="en" suppressHydrationWarning>
        <body className={cn("dark:bg-[#171717] bg-[#f5f5f5]", font.className)}>
          <NextTopLoader color="#4f5eff" />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="emridoc-theme"
          >
            <NewMedicationModal />
            <ViewMedicationModal />
            <Toaster closeButton position="bottom-right" richColors theme="system" />

            {children}
          </ThemeProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
