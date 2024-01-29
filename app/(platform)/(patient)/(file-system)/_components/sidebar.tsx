"use client";
import { ChevronsLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { ElementRef, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useFolderStore } from "../_components/hooks/use-folders";
import { NodeData2Type } from "@/app/types/file-types";
import { Navbar } from "./navbar";
import Arborist from "./file-tree/_components/tree";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { NewRootFolderBox } from "./new-root-folder-box";
// import { TrashBox } from "./trash-box";
interface SidebarProps {
  data: any[];
  singleLayerNodes: NodeData2Type[];
  usedFileStorageInGb: number;
  allotedStorageInGb: number;
}
export const Sidebar = ({ data, singleLayerNodes, usedFileStorageInGb, allotedStorageInGb }: SidebarProps) => {
  const folderStore = useFolderStore();
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [sidebarWidth, setSidebarWidth] = useState(isMobile ? window.innerWidth : 300);
  const usedFileStoragePercentage = (100 * usedFileStorageInGb) / allotedStorageInGb;

  useEffect(() => {
    console.log(" IN HERE");
    setIsMounted(true);
    console.log(data);
    console.log(singleLayerNodes);
    console.log(usedFileStoragePercentage);

    folderStore.setFolders(data);
    folderStore.setSingleLayerNodes(singleLayerNodes);
  }, []);

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
          <div className="pl-4 pt-4 w-20">
            <Logo showText={false} />
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
          {/* <div className="pt-4">
            <div>
              <Item label="Search" icon={Search} isSearch onClick={search.onOpen} />
              <Item onClick={handleCreate} label="New page" icon={PlusCircle} />
            </div>
          </div> */}
          {/* <div className="overflow-y-auto" style={{ height: `calc(100vh - 100px)` }}> */}
          {/* <CitiesTree width={sidebarWidth} /> */}
          <Arborist width={sidebarWidth} />
          {/* <Item onClick={handleCreate} icon={Plus} label="Add a page" /> */}
          {/* </div> */}

          <div className="flex flex-col py-4 px-6 gap-y-3">
            <NewRootFolderBox />
            <Separator />
            <div role="button" className="flex flex-col gap-y-1">
              <span className="text-sm font-light italic">{`${(usedFileStorageInGb * 1000).toFixed(
                2,
              )} Gb / ${allotedStorageInGb} Gb`}</span>
              <Progress className="h-2" value={usedFileStoragePercentage * 1000} />
            </div>
          </div>
          <div
            onMouseDown={handleMouseDown}
            onClick={resetWidth}
            //opacity-0 group-hover/sidebar:opacity-100
            className="hover:w-[6px] transition cursor-ew-resize absolute h-full w-[1px] bg-primary/10 right-0 top-0"
          />
        </aside>
        {/* </DragDropContext> */}
        <div
          ref={navbarRef}
          className={cn(
            "absolute top-0 z-[50] left-[300px] w-[calc(100%-300px)]",
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
