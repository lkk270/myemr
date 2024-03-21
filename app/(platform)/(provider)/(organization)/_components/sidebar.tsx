"use client";

import { ChevronsLeft, PackagePlus } from "lucide-react";
import { ElementRef, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { Navbar } from "./navbar";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

import Link from "next/link";
import { useLocalStorage } from "usehooks-ts";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion } from "@/components/ui/accordion";
import { NavItem } from "./nav-item";
import { OrganizationWithRoleType } from "@/app/types";
import { useOrganizationStore } from "./hooks/use-organizations";
interface SidebarProps {
  // data: any[];
  storageKey?: string;
  initialOrganizations: OrganizationWithRoleType[];
}
export const Sidebar = ({ storageKey = "myemr-storage-key", initialOrganizations }: SidebarProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { setOrganizations, organizations } = useOrganizationStore();
  const pathname = usePathname();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [sidebarWidth, setSidebarWidth] = useState(isMobile ? window.innerWidth : 300);

  const [expanded, setExpanded] = useLocalStorage<Record<string, any>>(storageKey, {});

  const currentUserPermissions = useCurrentUserPermissions();
  const session = useSession();
  const plan = session?.data?.user?.plan;

  useEffect(() => {
    setIsMounted(true);
    // console.log(organizations);
    setOrganizations(initialOrganizations);
  }, [initialOrganizations]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
    // trunk-ignore(eslint/react-hooks/exhaustive-deps)
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;
    if (newWidth < 300) newWidth = 300;
    if (newWidth > 420) newWidth = 420;
    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      setSidebarWidth(newWidth);
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`);
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };
  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);
      sidebarRef.current.style.width = isMobile ? "100%" : "300px";
      navbarRef.current.style.setProperty("width", isMobile ? "0" : "calc(100% - 300px)");
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "300px");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);
      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const defaultAccordionValue: string[] = Object.keys(expanded).reduce((acc: string[], key: string) => {
    if (expanded[key]) {
      acc.push(key);
    }
    return acc;
  }, []);

  const onExpand = (id: string) => {
    setExpanded((curr) => ({
      ...curr,
      [id]: !expanded[id],
    }));
  };

  return (
    isMounted && (
      <>
        {/* <DragDropContext onDragEnd={onDragEnd}> */}
        <aside
          ref={sidebarRef}
          className={cn(
            "group/sidebar h-full bg-[#f5f5f5] dark:bg-[#1a1a1a] overflow-y-auto relative flex w-[300px] flex-col",
            isResetting && "transition-all ease-in-out duration-300",
            isMobile && "w-0",
          )}
        >
          <div className="pl-4 w-20 flex flex-col pb-10 pt-4">
            <Logo />
            <div
              onClick={collapse}
              role="button"
              className={cn(
                "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
                isMobile && "opacity-100",
              )}
            >
              <ChevronsLeft className="h-6 w-6" />
            </div>
          </div>

          <div className="px-4">
            <div className="text-md font-medium flex items-center mb-1">
              <span>Organizations</span>
              <Button asChild type="button" size="icon" variant="ghost" className="ml-3">
                <Link href="/provider-home" onDragStart={(e) => e.preventDefault()}>
                  <PackagePlus className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <Accordion type="multiple" defaultValue={defaultAccordionValue} className="space-y-2">
              {organizations.map((organization) => (
                <NavItem
                  defaultAccordionValue={defaultAccordionValue}
                  width={sidebarWidth}
                  key={organization.id}
                  isActive={false}
                  isExpanded={expanded[organization.id]}
                  organization={organization as any}
                  onExpand={onExpand}
                />
              ))}
            </Accordion>
          </div>

          <div
            onMouseDown={handleMouseDown}
            onClick={resetWidth}
            //opacity-0 group-hover/sidebar:opacity-100
            className="hover:w-[6px] transition cursor-ew-resize absolute h-full w-[1px] bg-primary/10 right-0 top-0"
          />
        </aside>
        <div
          ref={navbarRef}
          className={cn(
            "bg-[#f8f7f7] dark:bg-[#1f1f1f] absolute top-0 z-[50] left-[300px] w-[calc(100%-300px)]",
            isResetting && "transition-all ease-in-out duration-300",
            isMobile && "left-0 w-full",
          )}
        >
          <Navbar isCollapsed={isCollapsed} onResetWidth={resetWidth} />
        </div>
      </>
    )
  );
};
