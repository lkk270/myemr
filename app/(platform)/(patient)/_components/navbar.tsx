"use client";
// import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { MobileSidebar } from "./mobile-sidebar";
import { navRoutes } from "@/lib/constants";

import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@/auth/components/auth/user-button";
import { useLoading } from "@/hooks/use-loading";
// import { Notifications } from "@/components/notifications";

interface NavbarProps {}

export const Navbar = ({}: NavbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { showLoading } = useLoading();

  const onNavigate = (url: string) => {
    showLoading();
    return router.push(url);
  };

  return (
    <div className="dark:bg-[#14161a] bg-[#fcfdfd] fixed z-50 flex items-center justify-between w-full h-16 px-4 py-2 border-b border-primary/10">
      <div className="flex items-center">
        <MobileSidebar />
        <Logo />
      </div>
      <div className="items-center sm:flex hidden">
        <div className="flex items-center sm:flex gap-x-1 lg:gap-x-4">
          {navRoutes.map((route, index) => (
            <div key={route.href}>
              <div
                onClick={() => onNavigate(route.href)}
                className={cn(
                  "text-muted-foreground text-xs group flex p-2 lg:px-4 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                  pathname === route.href && "bg-primary/10 text-primary",
                )}
              >
                <div className="flex flex-col items-center flex-1 gap-x-1 lg:gap-x-2">
                  <route.icon className="w-5 h-5" />
                  {route.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center sm:flex gap-x-4 justify-center">
          {/* {typeof userValues.numOfUnreadNotifications === "number" && (
						<Notifications numOfUnreadNotificationsParam={userValues.numOfUnreadNotifications} />
					)} */}
          <ModeToggle />
          {/* <UserButton afterSignOutUrl="/" /> */}
          <UserButton />
        </div>
      </div>
    </div>
  );
};
