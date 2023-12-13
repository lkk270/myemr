"use client";

import { Sidebar } from "./_components/sidebar";
import { SearchCommand } from "@/components/modals/search-command";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  if (!isLoaded) {
    return null;
  }
  if (!isSignedIn || user.unsafeMetadata.userType !== "patient") {
    return router.push("/");
  }

  return (
    <main className="h-full flex">
      {children}
      <div className="flex-1 h-full overflow-y-auto pt-16">
        <SearchCommand />
      </div>
    </main>
  );
};

export default MainLayout;
