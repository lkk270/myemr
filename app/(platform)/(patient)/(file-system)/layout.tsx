"use client";

import { Sidebar } from "./_components/sidebar";
import { SearchCommand } from "@/components/modals/search-command";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  if (!isSignedIn || user.unsafeMetadata.userType !== "patient") {
    return router.push("/");
  }

  return (
    <div className="h-full flex">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto pt-16">
        <SearchCommand />
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
