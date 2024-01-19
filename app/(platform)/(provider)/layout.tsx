import { redirect } from "next/navigation";
// import { currentUser } from "@clerk/nextjs";
import { MainNavbar } from "@/components/headers/main-navbar";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  // const user = await currentUser();
  // if (!user || user.unsafeMetadata.userType !== "provider") {
  //   return redirect("/");
  // }

  return (
    <div className="flex overflow-auto h-screen">
      <MainNavbar />
      <main className="flex-1 h-full overflow-y-auto">
        {/* <SearchCommand /> */}
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
