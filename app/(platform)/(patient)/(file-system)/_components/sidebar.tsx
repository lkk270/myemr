"use client";

import { ChevronsLeft } from "lucide-react";
import { ElementRef, useEffect, useRef, useState, useTransition } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Logo } from "@/components/logo";
import { addLastViewedAtAndSort, cn, extractNodes, sortFolderChildren, sortRootNodes } from "@/lib/utils";
import { useFolderStore } from "../_components/hooks/use-folders";
import { SingleLayerNodesType2 } from "@/app/types/file-types";
import { Navbar } from "./navbar";
import FileTree from "./file-tree/_components/tree";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { NewRootFolderBox } from "./new-root-folder-box";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { getAccessPatientCodeByToken } from "@/auth/data";
import { useSession } from "next-auth/react";
import { logout } from "@/auth/actions/logout";
import { usePatientManageAccountModal } from "@/auth/hooks/use-patient-manage-account-modal";
import { allotedStoragesInGb } from "@/lib/constants";
import { usePathname, useSearchParams } from "next/navigation";
import { fetchAllFoldersForPatient } from "@/lib/actions/files";

interface SidebarProps {
  data: any[];
  singleLayerNodes: SingleLayerNodesType2[];
  sumOfAllSuccessFilesSizes: bigint;
  numOfUnreadNotifications?: number;
}
export const Sidebar = ({ data, singleLayerNodes, sumOfAllSuccessFilesSizes, numOfUnreadNotifications = 0 }: SidebarProps) => {
  const folderStore = useFolderStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const searchParams = useSearchParams();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [sidebarWidth, setSidebarWidth] = useState(isMobile ? window.innerWidth : 300);
  const currentUserPermissions = useCurrentUserPermissions();
  const session = useSession();
  const plan = session?.data?.user?.plan;
  const { onOpen } = usePatientManageAccountModal();
  const allotedStorageInGb = !!session && !!session.data ? allotedStoragesInGb[session.data.user.plan] : 1;
  useEffect(() => {
    setIsMounted(true);
    // console.log(data);
    // console.log(singleLayerNodes);
    folderStore.setFolders(data);
    folderStore.setSingleLayerNodes(singleLayerNodes);
    folderStore.setSumOfAllSuccessFilesSizes(sumOfAllSuccessFilesSizes);
  }, []);

  useEffect(() => {
    const checkValidCode = async () => {
      if (!currentUserPermissions.isPatient) {
        const code = await getAccessPatientCodeByToken(session?.data?.tempToken);
        if (!code) {
          logout();
        }
      }
    };
    checkValidCode();
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

  useEffect(() => {
    const fetchFiles = () => {
      startTransition(() => {
        const userId = session?.data?.user.id;
        if (!userId) return;
        fetchAllFoldersForPatient(null, userId)
          .then((data) => {
            if (!!data) {
              const sortedFoldersTemp = data.map((folder) => sortFolderChildren(folder));
              const sortedFolders = sortRootNodes(sortedFoldersTemp);

              let rawAllNodes = extractNodes(data);
              const allNodesMap = new Map(rawAllNodes.map((node) => [node.id, { ...node, children: undefined }]));
              const allNodesArray = Array.from(allNodesMap.values());

              const singleLayerNodes = addLastViewedAtAndSort(allNodesArray);

              folderStore.setFolders(sortedFolders);
              folderStore.setSingleLayerNodes(singleLayerNodes);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      });
    };
    if (searchParams.get("manage-account-billing-plan") === "refresh") {
      fetchFiles();
    }
  }, [searchParams]);

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

  const formatStorageValue = (value: bigint) => {
    const formattedValue = (Number(value) / 1000000000).toFixed(4);
    return formattedValue === "-0.0000" ? "0.0000" : formattedValue;
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
          <div className="pl-4 pt-2 w-20">
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

          <FileTree width={sidebarWidth} />
          <div
            className={cn(
              currentUserPermissions.showActions && "flex flex-col py-3 px-6 gap-y-3 border-t border-primary/10",
            )}
          >
            {currentUserPermissions.showActions && <NewRootFolderBox />}
            {currentUserPermissions.isPatient && (
              <>
                <Separator />
                <div role="button" className="flex flex-col gap-y-1">
                  <Progress
                    className="h-1"
                    value={Number(folderStore.sumOfAllSuccessFilesSizes) / (10_000_000 * allotedStorageInGb)}
                  />
                  <div className="flex flex-row justify-between text-xs font-light ">
                    <span className="italic">{`${formatStorageValue(
                      folderStore.sumOfAllSuccessFilesSizes,
                    )} Gb / ${allotedStorageInGb} Gb`}</span>

                    {plan && !plan.includes("_PREMIUM_2") && (
                      <span role="button" onClick={() => onOpen("billing-plan")}>
                        Upgrade
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
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
          <Navbar
            isCollapsed={isCollapsed}
            onResetWidth={resetWidth}
            numOfUnreadNotifications={numOfUnreadNotifications}
          />
        </div>
      </>
    )
  );
};
