"use client";

import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Activity, Users, Settings, BriefcaseMedical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useOrganizationStore } from "./hooks/use-organizations";
import { usePathname } from "next/navigation";
import { OrganizationAvatar } from "./organization-avatar";
import { usePatientMemberStore } from "../(routes)/(patient)/hooks/use-patient-member-store";
import { cn } from "@/lib/utils";
import { useState } from "react";

type OrganizationType = {
  id: string;
  title: string;
  profileImageUrl?: string | null;
};

interface OrganizationDropdownProp {
  // initialOrganizations?: OrganizationWithRoleType[];
}
export const OrganizationDropdown = ({}: OrganizationDropdownProp) => {
  // const [isMounted, setIsMounted] = useState(false);
  const { patientMember } = usePatientMemberStore();
  const { organizations, getOrganizationById } = useOrganizationStore();
  const pathname = usePathname();
  const organizationId = pathname.includes("/organization/")
    ? pathname.split("/organization/")[1].split("/")[0]
    : !!patientMember
    ? patientMember.organizationId
    : null;

  if (!organizationId) {
    return null;
  }
  const currentOrganization = getOrganizationById(organizationId);

  const DropdownMenuSubComponent = ({ id, title, profileImageUrl }: OrganizationType) => {
    const isActiveOrganization = organizationId === id;
    const routes = [
      {
        label: "Patients",
        icon: <BriefcaseMedical className="h-4 w-4 mr-2" />,
        href: `/organization/${id}/patients`,
      },
      {
        label: "Activity",
        icon: <Activity className="h-4 w-4 mr-2" />,
        href: `/organization/${id}/activity`,
      },
      {
        label: "View or Edit",
        icon: <Settings className="h-4 w-4 mr-2" />,
        href: `/organization/${id}/settings`,
      },
      {
        label: "Members",
        icon: <Users className="h-4 w-4 mr-2" />,
        href: `/organization/${id}/members`,
      },
    ];
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger
          className={cn(isActiveOrganization && "text-[#44aaf7] border shadow-md shadow-secondary", "font-bold h-12")}
        >
          <div className="flex flex-row gap-x-3 items-center truncate">
            <div className="flex flex-col items-center justify-center w-[36px] h-[36px] border-2 border-primary/20 rounded-sm shrink-0">
              <OrganizationAvatar
                buildingParentDivPadding="p-[3px]"
                imageClassName="max-h-[30px] max-w-[30px] w-auto"
                buildingClassName="h-[24px] w-[24px]"
                profileImageUrl={profileImageUrl}
                imageSize={28}
              />
            </div>
            <div className="truncate">{title}</div>
          </div>
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            {routes.map((route, index) => (
              <Link href={route.href} key={index} onDragStart={(e) => e.preventDefault()}>
                <DropdownMenuItem
                  className={cn(pathname === route.href && "text-[#44aaf7] font-bold focus:text-[#44aaf7]")}
                >
                  {route.icon}
                  <span>{route.label}</span>
                </DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    );
  };

  if (!currentOrganization) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className={cn(pathname.includes("/file") ? "w-[130px] xxs:w-[150px] lg:w-48" : "w-40 xxs:w-48")}
      >
        <Button variant="outline" className="flex flex-row justify-between items-center p-1">
          <div className="flex flex-row gap-x-2 items-center flex-grow min-w-0">
            <div className="flex flex-col items-center justify-center w-[33px] h-[33px] border-2 border-primary/20 rounded-sm shrink-0">
              <OrganizationAvatar
                buildingParentDivPadding="p-[2px]"
                imageClassName="max-h-[27px] max-w-[27px] w-auto"
                buildingClassName="h-[22px] w-[22x]"
                profileImageUrl={currentOrganization.profileImageUrl}
                imageSize={25}
              />
            </div>
            <span className="text-left truncate text-sm flex-grow min-w-0">{currentOrganization.title}</span>
          </div>
          <div className="flex-shrink-0">
            <ChevronsUpDown className="w-4 h-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        {/* <DropdownMenuLabel>Organization</DropdownMenuLabel>
        <DropdownMenuSeparator /> */}
        <DropdownMenuGroup className="flex flex-col gap-y-1">
          {organizations.map(
            (organization, index) => (
              <DropdownMenuSubComponent
                key={index}
                id={organization.id}
                title={organization.title}
                profileImageUrl={organization.profileImageUrl}
              />
            ),
            // organizationId === organization.id ? (
            //   <DropdownMenuSubComponent
            //     key={index}
            //     id={organization.id}
            //     title={organization.title}
            //     profileImageUrl={organization.profileImageUrl}
            //   />
            // ) : (
            //   <Link
            //     href={`/organization/${organization.id}/settings`}
            //     key={index}
            //     onDragStart={(e) => e.preventDefault()}
            //   >
            //     <DropdownMenuItem className="flex flex-row gap-x-2">
            //       <div className="flex flex-col items-center justify-center w-[36px] h-[36px] border-2 border-primary/20 rounded-sm shrink-0">
            //         <OrganizationAvatar
            //           buildingParentDivPadding="p-[3px]"
            //           imageClassName="max-h-[30px] max-w-[30px] w-auto"
            //           buildingClassName="h-[24px] w-[24px]"
            //           profileImageUrl={organization.profileImageUrl}
            //           imageSize={28}
            //         />
            //       </div>
            //       <span className="truncate">{organization.title}</span>
            //     </DropdownMenuItem>
            //   </Link>
            // ),
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
