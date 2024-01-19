import { BasicNavbar } from "@/components/headers/basic-navbar";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full">
      <BasicNavbar />
      <div className="flex flex-col items-center justify-center pt-6">
        <SignUp />
      </div>
    </div>
  );
}
