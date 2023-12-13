"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import { LayoutGrid, LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface GenericNavigationMenuProps {
  navRoutes: {
    icon: LucideIcon;
    href: string;
    label: string;
  }[];
}

export const GenericNavigationMenu = ({ navRoutes }: GenericNavigationMenuProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const onNavigate = (url: string) => {
    return router.push(url);
  };

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent">
            <LayoutGrid className="hover:opacity-50  transition-opacity duration-300 p-0" />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[150px] gap-3 p-4 md:grid-cols-2 md:w-[250px] ">
              {navRoutes.map((route) => (
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
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  },
);
ListItem.displayName = "ListItem";
