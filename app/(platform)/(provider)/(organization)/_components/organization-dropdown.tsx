"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dot, ChevronsUpDown, Building2, Users, Activity, Settings } from "lucide-react";
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
type OrganizationType = {
  id: string;
  title: string;
};
export const OrganizationDropdown = () => {
  const pathname = usePathname();
  const organizationId = pathname.split("/organization/")[1].split("/")[0];
  const { organizations, getOrganizationById } = useOrganizationStore();
  const currentOrganization = getOrganizationById(organizationId);

  const DropdownMenuSubComponent = ({ id, title }: OrganizationType) => {
    const routes = [
      {
        label: "Patients",
        icon: <Users className="h-4 w-4 mr-2" />,
        href: `/organization/${id}/patients`,
      },
      {
        label: "Activity",
        icon: <Activity className="h-4 w-4 mr-2" />,
        href: `/organization/${id}/activity`,
      },
      {
        label: "Settings",
        icon: <Settings className="h-4 w-4 mr-2" />,
        href: `/organization/${id}/settings`,
      },
    ];
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <div className="flex flex-row gap-x-3 items-center">
            <Dot strokeWidth={10} className=" text-[#615cff]" />
            <div className="truncate w-full">{title}</div>
          </div>
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            {routes.map((route, index) => (
              <Link href={route.href} key={index}>
                <DropdownMenuItem>
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
      <DropdownMenuTrigger asChild className="w-48">
        <Button variant="outline" className="flex flex-row justify-between items-center p-1">
          <div className="flex flex-row gap-x-2 items-center flex-grow min-w-0">
            {currentOrganization.profileImageUrl ? (
              <Image width={30} height={30} src={currentOrganization.profileImageUrl} alt="image" />
            ) : (
              <div className="rounded-md p-[6px] bg-gradient-to-r from-indigo-400 via-violet-500 to-violet-600 text-white">
                <Building2 className="w-5 h-5" />
              </div>
            )}
            <span className="text-left truncate text-sm flex-grow min-w-0">
              {currentOrganization.title}sdfsdf sdf sadf sdfsdfsdfsdf
            </span>
          </div>
          <div className="flex-shrink-0">
            <ChevronsUpDown className="w-4 h-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Organization</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {organizations.map((organization, index) =>
            organizationId === organization.id ? (
              <DropdownMenuSubComponent key={index} id={organization.id} title={organization.title} />
            ) : (
              <Link href={`/organization/${organization.id}`} key={index}>
                <DropdownMenuItem>
                  <span className="truncate">{organization.title}</span>
                </DropdownMenuItem>
              </Link>
            ),
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
