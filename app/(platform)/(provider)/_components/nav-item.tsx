"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Activity, Users, Settings, Settings2, BriefcaseMedical, Building2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Organization } from "@prisma/client";
import Link from "next/link";

interface NavItemProps {
  isExpanded: boolean;
  isActive: boolean;
  organization: Organization;
  onExpand?: (id: string) => void;
  width: number;
}

export const NavItem = ({ isExpanded, isActive, organization, onExpand, width }: NavItemProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const routes = [
    {
      label: "Patients",
      icon: <BriefcaseMedical className="h-4 w-4 mr-2" />,
      href: `/organization/${organization.id}/patients`,
    },
    {
      label: "Activity",
      icon: <Activity className="h-4 w-4 mr-2" />,
      href: `/organization/${organization.id}/activity`,
    },
    {
      label: "Settings",
      icon: <Settings className="h-4 w-4 mr-2" />,
      routes: [
        {
          label: "View or Edit",
          icon: <Settings2 className="h-4 w-4 mr-2" />,
          href: `/organization/${organization.id}/settings`,
        },
        {
          label: "Members",
          icon: <Users className="h-4 w-4 mr-2" />,
          href: `/organization/${organization.id}/members`,
        },
      ],
    },
  ];

  const newWidth = (width - 100).toString();

  return (
    <AccordionItem value={organization.id} className="border-none">
      <AccordionTrigger
        onClick={() => !!onExpand && onExpand(organization.id)}
        className={cn(
          "flex items-center gap-x-2 p-2 rounded-md hover:bg-neutral-500/10 transition text-start no-underline hover:no-underline",
          isActive && !isExpanded && "bg-sky-500/10 text-sky-700",
        )}
      >
        <div className="flex items-center gap-x-2">
          {organization.profileImageUrl ? (
            <div className="w-7 h-7 relative">
              <Image
                sizes="28px"
                fill
                src={organization.profileImageUrl}
                alt="Organization"
                className="rounded-sm object-cover"
              />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-md p-[6px] bg-gradient-to-r from-indigo-400 via-violet-500 to-violet-600 text-white">
              <Building2 className="w-full h-full" />
            </div>
          )}
          <span className={`font-medium text-sm truncate`} style={{ maxWidth: `${newWidth}px` }}>
            {organization.title}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-0 pt-1 text-primary/70">
        {routes.map((route, index) =>
          !!route.href ? (
            <Link href={route.href} key={route.href}>
              <Button
                size="sm"
                className={cn(
                  "w-full font-normal justify-start pl-10 mb-1",
                  pathname === route.href && "bg-sky-500/10 text-sky-700",
                )}
                variant="ghost"
              >
                {route.icon}
                {route.label}
              </Button>
            </Link>
          ) : (
            <Accordion key={index} type="multiple" defaultValue={undefined} className="space-y-2">
              <AccordionItem value={organization.id} className="border-none">
                <AccordionTrigger
                  className={cn(
                    "flex flex-row gap-x-4 py-2 w-full font-normal justify-start pl-10 hover:bg-neutral-500/10 transition text-start no-underline hover:no-underline",
                    isActive && !isExpanded && "bg-sky-500/10 text-sky-700",
                  )}
                >
                  <div className="flex flex-row">
                    {route.icon}
                    {route.label}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 text-primary/70 pb-0">
                  {route.routes?.map((routesRoute) => (
                    <Link href={routesRoute.href} key={index.toString() + "-rr-" + routesRoute.href.toString()}>
                      <Button
                        size="sm"
                        className={cn(
                          "w-full font-normal justify-start pl-20 mb-1",
                          pathname === routesRoute.href && "bg-sky-500/10 text-sky-700",
                        )}
                        variant="ghost"
                      >
                        {routesRoute.icon}
                        {routesRoute.label}
                      </Button>
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ),
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

NavItem.Skeleton = function SkeletonNavItem() {
  return (
    <div className="flex items-center gap-x-2">
      <div className="w-10 h-10 relative shrink-0">
        <Skeleton className="h-full w-full absolute" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
};