
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";

export const Footer = () => {
  return (
    <div className="flex items-center w-full p-2 sm:p-6 z-50 pb-28 xs:pb-0">
      <Logo />

      <div className="ml-auto w-full justify-end flex items-center gap-x-1 text-muted-foreground">
        <span className="text-sm">myemr © 2024</span>
        <Link href="/privacy">
          <Button variant="ghost" size="sm">
            Privacy
          </Button>
        </Link>
        <Link href="/terms">
          <Button variant="ghost" size="sm">
            Terms
          </Button>
        </Link>
      </div>
    </div>
  );
};
