"use client";

import { usePathname } from "next/navigation";
import { Activity, Users, Settings, Settings2, BriefcaseMedical } from "lucide-react";

import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrganizationWithRoleType } from "@/app/types/organization-types";
import Link from "next/link";
import { OrganizationAvatar } from "./organization-avatar";
import { Badge } from "@/components/ui/badge";

interface NavItemProps {
  accordionValue: string[];
  setAccordionValue: (values: string[]) => void;
  defaultAccordionValue: string[];
  isExpanded: boolean;
  isActive: boolean;
  organization: OrganizationWithRoleType;
  onExpand?: (id: string) => void;
  width: number;
}

export const NavItem = ({
  accordionValue,
  setAccordionValue,
  isExpanded,
  isActive,
  organization,
  onExpand,
  width,
  defaultAccordionValue,
}: NavItemProps) => {
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
          isActive && !isExpanded && "bg-neutral-500/10 ",
        )}
      >
        <div className="flex items-center gap-x-2">
          <div className="flex flex-col items-center justify-center w-[38px] h-[38px] border-2 border-primary/20 rounded-sm shrink-0">
            <OrganizationAvatar
              buildingParentDivPadding="p-[4px]"
              imageClassName="max-h-[32px] max-w-[32px] w-auto"
              buildingClassName="h-[24px] w-[24px]"
              profileImageUrl={organization.profileImageUrl}
              imageSize={30}
            />
          </div>
          <span className={`font-medium text-sm truncate`} style={{ maxWidth: `${newWidth}px` }}>
            {organization.title}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-0 pt-1 text-primary/70">
        {routes.map((route, index) =>
          !!route.href ? (
            <Link href={route.href} key={route.href} onDragStart={(e) => e.preventDefault()}>
              <Button
                size="sm"
                className={cn(
                  "w-full font-normal justify-start pl-10 mb-1",
                  pathname === route.href && "bg-neutral-500/10 text-primary",
                )}
                variant="ghost"
              >
                {route.icon}
                {route.label}

                {route.label === "Activity" && organization.numOfUnreadActivities > 0 && (
                  <Badge className="hover:bg-red-500 ml-3 justify-center w-4 h-4 text-[10px] text-white bg-red-500">
                    {organization.numOfUnreadActivities > 9 ? "9+" : organization.numOfUnreadActivities.toString()}
                  </Badge>
                )}
              </Button>
            </Link>
          ) : (
            <Accordion
              key={index}
              type="multiple"
              onValueChange={setAccordionValue}
              value={accordionValue}
              defaultValue={defaultAccordionValue}
              className="space-y-2"
            >
              <AccordionItem value={organization.id + "settings"} className="border-none">
                <AccordionTrigger
                  onClick={() => !!onExpand && onExpand(organization.id + "settings")}
                  className={cn(
                    "flex flex-row gap-x-4 rounded-md py-2 w-full font-normal justify-start pl-10 hover:bg-neutral-500/10 transition text-start no-underline hover:no-underline",
                    isActive && !isExpanded && "bg-neutral-500/10 text-primary",
                  )}
                >
                  <div className="flex flex-row">
                    {route.icon}
                    {route.label}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 text-primary/70 pb-0">
                  {route.routes?.map((routesRoute) => (
                    <Link
                      href={routesRoute.href}
                      key={index.toString() + "-rr-" + routesRoute.href.toString()}
                      onDragStart={(e) => e.preventDefault()}
                    >
                      <Button
                        size="sm"
                        className={cn(
                          "w-full font-normal justify-start pl-20 mb-1",
                          pathname === routesRoute.href && "bg-neutral-500/10 text-primary",
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
