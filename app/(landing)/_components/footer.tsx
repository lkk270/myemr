import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";

export const Footer = () => {
  return (
    <div className="flex items-center w-full p-2 sm:p-6 z-50 pb-28 xs:pb-0">
      <div className="xxs:flex hidden">
        <Logo />
      </div>

      <div className="ml-auto w-full justify-end flex items-center gap-x-1 text-muted-foreground">
        <span className="text-xs">myemr © 2024</span>
        <Link href="/pricing">
          <Button variant="ghost" size="sm">
            <span className="text-xs xxs:text-sm">Pricing</span>
          </Button>
        </Link>
        <Link href="/privacy">
          <Button variant="ghost" size="sm">
            <span className="text-xs xxs:text-sm">Privacy</span>
          </Button>
        </Link>
        <Link href="/terms">
          <Button variant="ghost" size="sm">
            <span className="text-xs xxs:text-sm">Terms</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
