import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const NotFound = () => {
  return (
    <main className="h-screen w-full flex flex-col justify-center items-center bg-[#1A2238]">
      <div className="pb-10">
        <Image alt="not-found" src={"/space.svg"} width={250} height={250} />
      </div>
      <h1 className="text-9xl font-extrabold text-white tracking-widest">404</h1>
      <div className="bg-[#8d4fff] px-2 text-sm rounded rotate-12 absolute mt-44">Page Not Found</div>
      <Link href="/">
        <Button variant={"gooeyLeftGhost"} className="bg-secondary shadow-lg border-b-[4px] border-[#8d4fff]">
          <MoveLeft className="w-3 h-3 mr-2" />
          Go Home
        </Button>
      </Link>
    </main>
  );
};

export default NotFound;
