import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SomethingNotFoundProps {
  title: string;
  href: string;
  hrefTitle?: string;
}

export const SomethingNotFound = ({ title, href, hrefTitle = "Go home" }: SomethingNotFoundProps) => {
  return (
    <main className="h-screen w-full flex flex-col justify-center items-center">
      <div className="pb-10">
        <Image alt="not-found" src={"/space.svg"} width={250} height={250} />
      </div>
      <div className="text-lg xs:text-xl sm:text-4xl font-bold p-3 xs:p-8">{title}</div>
      <Link href={href}>
        <Button variant={"gooeyLeftGhost"} className="bg-secondary shadow-lg border-b-[4px] border-[#8d4fff]">
          <MoveLeft className="w-3 h-3 mr-2" />
          {hrefTitle}
        </Button>
      </Link>
    </main>
  );
};
