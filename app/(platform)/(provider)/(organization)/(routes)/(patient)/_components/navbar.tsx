"use client";
// import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { MobileSidebar } from "./mobile-sidebar";
import { patientRoutesForProvider } from "@/lib/constants";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { usePathname } from "next/navigation";
import { UserButton } from "@/components/user-button";
import Link from "next/link";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { usePatientMemberStore } from "../hooks/use-patient-member-store";
import { useOrganizationStore } from "../../../_components/hooks/use-organizations";
import { Notifications } from "@/components/notifications";
// import { Notifications } from "@/components/notifications";
import { useEffect, useState } from "react";
import { OrganizationDropdown } from "../../../_components/organization-dropdown";
import { OrganizationWithRoleType } from "@/app/types";
import { useMediaQuery } from "usehooks-ts";
import { PatientMember } from "@prisma/client";

interface NavbarProps {
  initialPatientMember: PatientMember;
  initialOrganizations: OrganizationWithRoleType[];
  numOfUnreadNotifications?: number;
}

export const Navbar = ({ initialPatientMember, numOfUnreadNotifications, initialOrganizations }: NavbarProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { patientMember, setPatientMember } = usePatientMemberStore();
  const { setOrganizations } = useOrganizationStore();
  const isMobile = useMediaQuery("(max-width: 350px)");
  const isMobile2 = useMediaQuery("(max-width: 305px)");

  // const { patientMember } = usePatientMemberStore();
  const currentUserPermissions = useCurrentUserPermissions();
  const pathname = usePathname();

  useEffect(() => {
    setPatientMember(initialPatientMember);
    setOrganizations(initialOrganizations);
    setIsMounted(true);
  }, []);

  if (!isMounted || !patientMember) {
    return (
      <div className="dark:bg-[#1f1f1f] bg-[#f8f7f7] fixed z-[50] flex items-center w-full h-16 px-4 py-2 border-b border-primary/10">
        <div className="flex items-center justify-start flex-1">
          <Logo />
        </div>
      </div>
    );
  }
  const routes = patientRoutesForProvider(patientMember.id);

  return (
    <div className="dark:bg-[#1f1f1f] bg-[#f8f7f7] fixed z-[50] flex items-center w-full h-16 px-4 py-2 border-b border-primary/10">
      <div className="flex items-center justify-start flex-1">
        <MobileSidebar />
        {!isMobile2 && <Logo showText={!isMobile} />}
      </div>
      <div className="flex-1 justify-center hidden sm:flex">
        <div className="flex items-center gap-x-1 lg:gap-x-4">
          {routes.map((route, index) => (
            <Link key={index} href={route.href} onDragStart={(e) => e.preventDefault()}>
              <div
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
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end flex-1 gap-x-4">
        <OrganizationDropdown />
        {currentUserPermissions.hasAccount && typeof numOfUnreadNotifications === "number" && (
          <Notifications numOfUnreadNotificationsParam={numOfUnreadNotifications} />
        )}
        {!isMobile && <ModeToggle />}
        <UserButton />
      </div>
    </div>
  );
};
