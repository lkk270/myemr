import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

export const CodeNotFound = () => {
  return (
    <main className="h-screen w-full flex flex-col justify-center items-center">
      <div className="text-lg xs:text-xl sm:text-4xl font-bold p-3 xs:p-8">Code is not valid</div>
      <Link href="/">
        <Button variant={"gooeyLeftGhost"} className="bg-secondary shadow-lg border-b-[4px] border-[#8d4fff]">
          <MoveLeft className="w-3 h-3 mr-2" />
          Go Home
        </Button>
      </Link>
    </main>
  );
};
