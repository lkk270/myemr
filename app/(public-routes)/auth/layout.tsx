import { BasicNavbar } from "@/components/headers/basic-navbar";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="justify-start p-4">
        <BasicNavbar />
      </div>
      <div className="flex overflow-auto h-full">
        <main className="flex-1 flex pt-0 justify-center px-1">
          <div className="max-h-[87vh] w-full max-w-[500px]">{children}</div>
        </main>
      </div>
    </>
  );
};

export default AuthLayout;
