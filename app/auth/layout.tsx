import { BasicNavbar } from "@/components/headers/basic-navbar";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="justify-start p-4">
        <BasicNavbar />
      </div>
      <div className="flex overflow-auto h-screen">
        <main className="flex-1 flex pt-10 sm:pt-0 justify-center p-4" style={{ minHeight: "100vh" }}>
          <div className="overflow-y-auto max-h-full w-full max-w-[500px]">{children}</div>
        </main>
      </div>
    </>
  );
};

export default AuthLayout;
