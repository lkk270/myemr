"use client";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { patientNavRoutes, tempPatientAccessNavRoutes, tempPatientUploadAccessNavRoutes } from "@/lib/constants";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { usePathname } from "next/navigation";
import { UserButton } from "@/components/user-button";
import Link from "next/link";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { Notifications } from "@/components/notifications";
import dynamic from "next/dynamic";
const MobileSidebar = dynamic(() => import("./mobile-sidebar"), { ssr: false });

// import { Notifications } from "@/components/notifications";

interface NavbarProps {
  tempAccess?: boolean;
  numOfUnreadNotifications?: number;
}

export const Navbar = ({ tempAccess = false, numOfUnreadNotifications }: NavbarProps) => {
  const currentUser = useCurrentUser();
  const currentUserPermissions = useCurrentUserPermissions();
  const pathname = usePathname();

  const routes = currentUserPermissions.isPatient
    ? patientNavRoutes
    : currentUser?.role === "UPLOAD_FILES_ONLY"
    ? tempPatientUploadAccessNavRoutes
    : tempPatientAccessNavRoutes;

  return (
    <div className="dark:bg-[#1f1f1f] bg-[#f8f7f7] fixed z-[50] flex items-center justify-between w-full h-16 px-4 py-2 border-b border-primary/10">
      <div className="flex items-center">
        <MobileSidebar />
        <Logo />
      </div>
      <div className="items-center sm:flex hidden">
        <div className="flex items-center sm:flex gap-x-1 lg:gap-x-4">
          {routes.map((route, index) => (
            <Link key={index} href={route.href} onDragStart={(e) => e.preventDefault()}>
              <div
                className={cn(
                  "text-muted-foreground text-xs group flex p-2 lg:px-4 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                  (pathname === route.href || `/${pathname.split("/")[1]}` === route.href) &&
                    "bg-primary/10 text-primary",
                )}
              >
                <div className="flex flex-col items-center flex-1 gap-x-1 lg:gap-x-2">
                  <route.icon className="w-5 h-5" />
                  {route.label}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center sm:flex gap-x-4 justify-center">
          {currentUserPermissions.hasAccount && typeof numOfUnreadNotifications === "number" && (
            <Notifications numOfUnreadNotificationsParam={numOfUnreadNotifications} />
          )}
          <ModeToggle />
          {/* <UserButton afterSignOutUrl="/" /> */}
          <UserButton />
        </div>
      </div>
    </div>
  );
};
