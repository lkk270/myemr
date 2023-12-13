import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
// import { MainNavbar } from "@/components/headers/main-navbar";
import { Navbar } from "../_components/navbar";
import { Sidebar } from "./_components/sidebar";
import { SearchCommand } from "@/components/modals/search-command";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await currentUser();

  if (!user || user.unsafeMetadata.userType !== "patient") {
    return redirect("/");
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
