import "./globals.css";
import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

import HolyLoader from "holy-loader";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { DeleteMedicationModal } from "./(platform)/(patient)/(non-file-system)/medications/_components/modals/delete-medication-modal";
import { NewMedicationModal } from "./(platform)/(patient)/(non-file-system)/medications/_components/modals/new-medication-modal";
import { ViewMedicationModal } from "./(platform)/(patient)/(non-file-system)/medications/_components/modals/view-medication-modal";

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyEMR",
  description: "A patient focused EMR",
  appleWebApp: true,
  // robots: {
  //   index: true,
  //   follow: true,
  //   nocache: true,
  //   googleBot: {
  //     index: true,
  //     follow: true,
  //     noimageindex: false,
  //     "max-video-preview": -1,
  //     "max-image-preview": "large",
  //     "max-snippet": -1,
  //   },
  // },
};

// export const viewport: Viewport = {
//   width: "device-width",
//   initialScale: 1.2,
//   maximumScale: 1,
//   userScalable: false,
//   minimumScale: 0.9,

// };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    //dark:bg-[#171717] bg-[#f5f5f5]
    //bg-secondary/5
    //dark:bg-[#1f1f1f] bg-[#fafafa]
    <>
      {/* <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head> */}
      <SessionProvider session={session}>
        <html lang="en" suppressHydrationWarning>
          <meta name="viewport" content="width=device-width, user-scalable=no" />
          <meta name="robots" content="all" />
          <meta name="googlebot" content="all" />
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-YQ9BH7HH4H"></script>
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-YQ9BH7HH4H');
            `}
          </script>
          {/* <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" /> */}
          <body className={cn(font.className)}>
            <NewMedicationModal />
            <ViewMedicationModal />
            <DeleteMedicationModal />
            {/* <NextTopLoader color="#4f5eff" /> */}
            <HolyLoader color="#4f5eff" height={4} speed={250} easing="linear" showSpinner />
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              storageKey="myemr-theme"
            >
              <Toaster closeButton position="bottom-right" richColors theme="system" />

              {children}
              <SpeedInsights />
            </ThemeProvider>
          </body>
        </html>
      </SessionProvider>
    </>
  );
}
