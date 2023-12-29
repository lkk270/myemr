import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
// import { MainNavbar } from "@/components/headers/main-navbar";
import { Navbar } from "../_components/navbar";
import { Sidebar } from "../_components/sidebar";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await currentUser();

  if (!user || user.unsafeMetadata.userType !== "patient") {
    return redirect("/");
  }

  return (
    <div className="flex overflow-auto h-screen">
      <Navbar />
      <main className="pt-16 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default MainLayout;
