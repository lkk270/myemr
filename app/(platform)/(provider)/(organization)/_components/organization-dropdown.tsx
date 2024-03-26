"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {} from "lucide-react";
import { ChevronsUpDown, Activity, Users, Settings, BriefcaseMedical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
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
import { cn } from "@/lib/utils";

type OrganizationType = {
  id: string;
  title: string;
  profileImageUrl?: string | null;
};
export const OrganizationDropdown = () => {
  const pathname = usePathname();
  const organizationId = pathname.split("/organization/")[1].split("/")[0];
  const { organizations, getOrganizationById } = useOrganizationStore();
  const currentOrganization = getOrganizationById(organizationId);

  const DropdownMenuSubComponent = ({ id, title, profileImageUrl }: OrganizationType) => {
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
        <DropdownMenuSubTrigger className="text-[#44aaf7] font-bold bg-secondary">
          <div className="flex flex-row gap-x-3 items-center">
            <div className="border-2 border-[#44aaf7] rounded-sm shrink-0">
              {/* <Dot strokeWidth={5} className=" text-[#615cff]" /> */}
              <OrganizationAvatar
                buildingClassName="w-4 h-4"
                profileImageUrl={profileImageUrl}
                imageSize={50}
                buildingParentDivPadding="p-[4px]"
              />
            </div>
            <div className="truncate w-full">{title}</div>
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
      <DropdownMenuTrigger asChild className="w-42 xs:w-48">
        <Button variant="outline" className="flex flex-row justify-between items-center p-1">
          <div className="flex flex-row gap-x-2 items-center flex-grow min-w-0">
            <OrganizationAvatar
              buildingClassName="w-5 h-5"
              profileImageUrl={currentOrganization.profileImageUrl}
              imageSize={30}
            />
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
        <DropdownMenuGroup>
          {organizations.map((organization, index) =>
            organizationId === organization.id ? (
              <DropdownMenuSubComponent
                key={index}
                id={organization.id}
                title={organization.title}
                profileImageUrl={organization.profileImageUrl}
              />
            ) : (
              <Link href={`/organization/${organization.id}`} key={index} onDragStart={(e) => e.preventDefault()}>
                <DropdownMenuItem className="flex flex-row gap-x-2">
                  <OrganizationAvatar
                    buildingClassName="w-4 h-4"
                    profileImageUrl={organization.profileImageUrl}
                    imageSize={16}
                    buildingParentDivPadding="p-[4px]"
                  />
                  <span className="truncate">{organization.title}asdfsadfasdfsdfsdf</span>
                </DropdownMenuItem>
              </Link>
            ),
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
