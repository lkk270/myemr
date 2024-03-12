"use client";

import { navRoutes, tempPatientAccessNavRoutes, tempPatientUploadAccessNavRoutes } from "@/lib/constants";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { useCurrentUser } from "@/auth/hooks/use-current-user";

import { usePathname } from "next/navigation";
import { SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const Sidebar = () => {
  const currentUser = useCurrentUser();
  const currentUserPermissions = useCurrentUserPermissions();
  const pathname = usePathname();

  const routes = currentUserPermissions.isPatient
    ? navRoutes
    : currentUser?.role === "UPLOAD_FILES_ONLY"
    ? tempPatientUploadAccessNavRoutes
    : tempPatientAccessNavRoutes;

  return (
    <>
      <div className={cn("h-full bg-secondary overflow-y-auto relative flex w-full flex-col")}>
        <div className="flex justify-center flex-1 p-3">
          <div className="flex flex-col items-center space-y-2 pt-7">
            {routes.map((route, index) => (
              <SheetClose asChild key={index}>
                <Link key={route.href} href={route.href} onDragStart={(e) => e.preventDefault()}>
                  <div
                    className={cn(
                      "text-muted-foreground text-xs group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                      pathname === route.href && "bg-primary/10 text-primary",
                    )}
                  >
                    <div className="flex flex-col items-center justify-center flex-1 gap-y-2">
                      <route.icon className="w-5 h-5" />
                      {route.label}
                    </div>
                  </div>
                </Link>
              </SheetClose>
            ))}
            <div className="px-2 text-xs text-center text-primary/40">myemr © 2024</div>
          </div>
        </div>
      </div>
    </>
  );
};
