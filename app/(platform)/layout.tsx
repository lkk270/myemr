import { MainNavbar } from "@/components/headers/main-navbar";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <MainNavbar />
      <div className="fixed inset-y-0 flex-col hidden w-20 mt-16 md:flex">
        {/* <Sidebar /> */}
      </div>
      <main className="h-full pt-16">{children}</main>
    </div>
  );
};

export default RootLayout;
