"use client";

import { ChevronsLeft, MenuIcon, Plus, PlusCircle, Search, Settings, Trash } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ElementRef, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { toast } from "sonner";
import { Logo } from "@/components/logo";

import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useSearch } from "@/hooks/use-search";
import { FoldersTree } from "./folders-tree";
import { Item } from "./item";
import { Navbar } from "./navbar";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { CitiesTree } from "../(test)/cities-tree";
// import { TrashBox } from "./trash-box";

interface SidebarProps {
  data: any[];
}

export const Sidebar = ({ data }: SidebarProps) => {
  const router = useRouter();
  const search = useSearch();
  const params = useParams();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

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

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
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

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty("width", isMobile ? "0" : "calc(100% - 240px)");
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");
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

  const handleCreate = () => {
    // const promise = create({ title: "Untitled" }).then((documentId) => router.push(`/documents/${documentId}`));
    // toast.promise(promise, {
    //   loading: "Creating a new note...",
    //   success: "New note created!",
    //   error: "Failed to create a new note.",
    // });
  };

  const onDragEnd = (result: any) => {
    // Logic to handle drag end event
    // This is where you would reorder folders/files based on the drag result
  };
  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <aside
          ref={sidebarRef}
          className={cn(
            "group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999]",
            isResetting && "transition-all ease-in-out duration-300",
            isMobile && "w-0",
          )}
        >
          <div className="pt-2 flex justify-between p-4">
            <Logo showText={false} />

            <div
              onClick={collapse}
              role="button"
              className={cn(
                "h-6 w-6 mt-3 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 relative opacity-0 group-hover/sidebar:opacity-100 transition",
                isMobile && "opacity-100",
              )}
            >
              <ChevronsLeft className="h-6 w-6" />
            </div>
          </div>
          <div className="pt-4">
            <div>
              <Item label="Search" icon={Search} isSearch onClick={search.onOpen} />
              <Item onClick={handleCreate} label="New page" icon={PlusCircle} />
            </div>
            <div className="mt-4">
              <CitiesTree width={navbarRef?.current?.style.getPropertyValue("width")} />
              {/* <Item onClick={handleCreate} icon={Plus} label="Add a page" /> */}
            </div>
            <div
              onMouseDown={handleMouseDown}
              onClick={resetWidth}
              className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
            />
          </div>
        </aside>
      </DragDropContext>

      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full",
        )}
      >
        <Navbar isCollapsed={isCollapsed} onResetWidth={resetWidth} />
      </div>
    </>
  );
};
