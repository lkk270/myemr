import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";

export const Footer = () => {
  return (
    <div className="flex flex-col w-full p-2 sm:p-6 z-50 pb-28 xs:pb-0">
      <div className="flex items-center w-full">
        <div className="xxs:flex hidden">
          <Logo />
        </div>

        <div className="ml-auto flex justify-end items-center gap-x-1 text-muted-foreground">
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
      {/* New line for Location & Contact */}
      <div className="text-muted-foreground flex flex-col sm:flex-row justify-between items-center mt-4 pb-4">
        <div className="text-xs sm:text-sm">Location: New York, NY</div>
        <span className="text-xs">myemr © 2024</span>

        <Link href="mailto:hello@myemr.io" className="mt-2 sm:mt-0">
          <Button variant="ghost" size="sm">
            <span className="text-xs xxs:text-sm">Contact Us</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

// <div className="text-muted-foreground flex flex-col sm:flex-row justify-center items-center mt-4 pb-4">
// <div className="text-xs sm:text-sm absolute left-2 sm:left-6">Location: New York, NY</div>
// <span className="text-xs">myemr © 2024</span>
// <Link href="mailto:hello@myemr.io" className="absolute right-2 sm:right-6 mt-2 sm:mt-0">
//   <Button variant="ghost" size="sm">
//     <span className="text-xs xxs:text-sm">Contact Us</span>
//   </Button>
// </Link>
// </div>
