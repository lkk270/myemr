import { BasicNavbar } from '@/components/headers/basic-navbar';
import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="w-full">
      <BasicNavbar />
      <div className="flex flex-col items-center justify-center pt-6">
        <SignIn />
      </div>
    </div>
  );
}
