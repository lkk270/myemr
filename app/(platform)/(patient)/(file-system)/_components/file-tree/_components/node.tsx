import React, { useState, useEffect, useRef } from "react";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import { ChevronRight, ChevronDown, MoreHorizontal, FolderInput } from "lucide-react";
import { usePathname } from "next/navigation";
import DragContext from "./drag-context";
import { cn, getFileIcon } from "@/lib/utils";
import { useMediaQuery } from "usehooks-ts";
import { MenuHeader } from "./menu-header";
import { Button } from "@/components/ui/button";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionDropdown } from "./action-dropdown";
import { useMenuItems } from "./hooks";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { NodeDataType } from "@/app/types/file-types";
import Link from "next/link";

type NodeProps = {
  node: any;
  style: React.CSSProperties;
  dragHandle: any; // Replace 'any' with the appropriate type
  tree: any; // Replace 'any' with the appropriate type
};

// Common function for handling menu item clicks

const iconSize = "17px";
const folderColor = "#4f5eff";
const iconClassName = "w-4 h-4 mr-2";

const Node: React.FC<NodeProps> = ({ node, style, dragHandle, tree }) => {
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 450px)");
  const pathname = usePathname();
  const hasMountedRef = useRef<boolean>(false);
  const prevPathnameRef = useRef<string | null>(pathname);
  let nodeIdFromPath = "";
  if (pathname.includes("/files/")) {
    nodeIdFromPath = pathname.split("/files/")[1];
  } else if (pathname.includes("/file/")) {
    nodeIdFromPath = pathname.split("/file/")[1];
  }

  const completeNodePath = node.data.isFile ? node.data.path : `${node.data.path}${node.data.id}/`;

  // const [isDragOver, setIsDragOver] = useState(false);
  const { hoveredNode, setHoveredNode, draggedNode, setDraggedNode, contextDisableDrop } =
    React.useContext(DragContext);

  const nodeData = node.data;
  const customNodeData: NodeDataType = {
    id: nodeData.id,
    name: nodeData.name,
    parentId: nodeData.parentId,
    path: completeNodePath,
    namePath: nodeData.namePath,
    isFile: nodeData.isFile,
  };

  const menuItems = useMenuItems(customNodeData);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // if (!isMounted) {
  //   return null;
  // }

  // useEffect(() => {
  //   if (tree && !isMounted) {
  //     setIsMounted(true);
  //     console.log(isMounted);
  //     console.log("IN 83");
  //     tree.openParents(nodeIdFromPath);
  //     if (!tree.get(nodeIdFromPath)?.data.isFile) {
  //       tree.open(nodeIdFromPath);
  //     }
  //   }
  // }, []);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname || !hasMountedRef.current) {
      if (tree) {
        tree.openParents(nodeIdFromPath);
        if (!tree.get(nodeIdFromPath)?.data.isFile) {
          tree.open(nodeIdFromPath);
        }
      }
      hasMountedRef.current = true;
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  const CustomIcon = node.data.isFile ? getFileIcon(node.data.name, nodeData.type) : FaFolder;

  let isBackgroundChanged4 = false;
  if (
    draggedNode.id &&
    draggedNode.isFile &&
    completeNodePath.includes(hoveredNode.path) &&
    hoveredNode.path !== draggedNode.path
    // completeNodePath !== draggedNode.path
  ) {
    isBackgroundChanged4 = true;
  }

  if (
    draggedNode.id &&
    !draggedNode.isFile &&
    completeNodePath.includes(hoveredNode.path) &&
    // completeNodePath !== draggedNode.path &&
    // !completeNodePath.includes(draggedNode.path) &&
    // completeNodePath !== draggedNode.path?.split("/" + draggedNode.id)[0] + "/" &&
    hoveredNode.path !== draggedNode.path?.split("/" + draggedNode.id)[0] + "/"
  ) {
    isBackgroundChanged4 = true;
  }

  // const handleDragOver = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   const parentFolder = node.isLeaf ? node.parent : node;
  //   if (hoveredNode.id && hoveredNode.id !== parentFolder.id && draggedNode.id !== parentFolder.id) {
  //     setHoveredNode({ id: parentFolder.id, parentId: parentFolder.data.parentId });
  //   }
  // };

  // const handleDragLeave = () => {
  //   if (hoveredNode.id === node.id) {
  //     // setHoveredNodeId(null);
  //   }
  // };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (node.data.isFile) {
      // Check if it's a file
      setHoveredNode({
        id: node.data.id,
        parentId: node.data.parentId,
        namePath: node.data.namePath,
        path: completeNodePath,
        isFile: node.data.isFile,
      });
    } else if (!node.data.isFile) {
      // If it's a folder
      setHoveredNode({
        id: node.data.id,
        parentId: node.data.parentId,
        namePath: node.data.namePath,
        path: completeNodePath,
        isFile: node.data.isFile,
      });
    }
  };

  const handleDragStart = () => {
    setDraggedNode({
      id: node.id,
      parentId: node.data.parentId,
      path: completeNodePath,
      namePath: node.data.namePath,
      isFile: node.data.isFile,
    });
  };

  const handleDragEnd = () => {
    // if (hoveredNode.id) {
    //   const selectedNodes = Array.from(tree.selectedIds).map((id) => tree.get(id).data);
    //   console.log(selectedNodes);
    //   console.log(selectedNodes.length);
    //   foldersStore.moveNodes(selectedNodes, hoveredNode);
    // }
    setDraggedNode({ id: null, parentId: null, path: null, namePath: null, isFile: null });
  };

  // const handleDrop = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   // Logic to handle the drop action
  //   // For example, moving the dragged item to the dropped-on folder

  //   // After handling the drop, reset the hovered state
  //   setHoveredNode({ id: null, parentId: null });
  // };

  // const isNodeOrParentHovered = (node: any) => {
  //   return hoveredNode.id === node.id || (node.parent && hoveredNode.id === node.parent.id);
  // };

  // const isNodeOrChildHovered = (node: any) => {
  //   return hoveredNode.id === node.id || node.children?.some((child: any) => isNodeOrChildHovered(child));
  // };

  // ${
  //   isNodeOrParentHovered(node) ? "bg-blue-200" : ""
  // }
  // if (node.state.willReceiveDrop && node.state.id && node.state.id !== draggedNode.id) {
  //   console.log("node.state.id: " + node.state.id);
  //   console.log("draggedNodeId: " + draggedNodeId);
  //   console.log("TRUEE");
  // }
  // if (draggedNodeParentId) {
  //   console.log(draggedNodeParentId);
  // }
  const handleDragLeave = () => {
    setHoveredNode({ id: null, parentId: null, path: null, namePath: null, isFile: null });
  };

  // console.log(`w-[${(tree.width - 100).toString()}px]`);
  return (
    <div className="px-2">
      {isMounted && (
        <ContextMenu>
          <ContextMenuTrigger
            className={cn(
              "node-container",
              "text-muted-foreground p-2 flex items-center h-full node-container rounded-sm",
              // `max-w-[${(tree.width - 100).toString()}px]`,
              !node.state.isSelected &&
                !node.state.isDragging &&
                !node.isEditing &&
                !draggedNode.id &&
                "hover:bg-primary/10 py-[6.45px] hover:text-primary",
              node.state.isSelected &&
                !node.state.isDragging &&
                !node.isEditing &&
                !draggedNode.id &&
                "bg-primary/10 py-[6.45px] text-primary",
              // node.state.willReceiveDrop && node.id !== draggedNode.id && node.id !== draggedNode.parentId && "bg-blue-300",

              draggedNode.id &&
                hoveredNode.id &&
                !contextDisableDrop &&
                // node.id !== draggedNode.id &&
                // node.id !== draggedNode.parentId &&
                isBackgroundChanged4 &&
                "bg-primary/10 rounded-none py-[6.45px] text-primary",
              // node.id.includes(draggedNode.parentId) &&
              //   node.id !== draggedNode.id &&
              //   node.id !== draggedNode.parentId &&
              //   "bg-blue-300",

              nodeIdFromPath === node.id && "border-[1px] border-[#4f5eff]",
            )}
            style={style}
            // style={{ ...style, paddingRight: "20px" }}
            ref={dragHandle}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            // onDrop={handleDrop}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Node Content */}
            <div
              style={{ lineHeight: "18px", fontSize: "13px" }}
              className={cn(
                `min-w-[${(tree.width - 100).toString()}px]`,
                "truncate flex items-center cursor-pointer flex-grow",
              )}
            >
              {node.data.isFile ? (
                <>
                  <span className="w-5 flex-shrink-0 mr-1"></span>
                  <span className="mr-2 flex items-center flex-shrink-0">
                    <CustomIcon size={iconSize} />
                  </span>
                </>
              ) : (
                <>
                  <span
                    className="mr-2 flex-shrink-0"
                    onClick={() => {
                      node.isInternal && node.toggle();
                    }}
                  >
                    {node.isOpen ? <ChevronDown size={iconSize} /> : <ChevronRight size={iconSize} />}
                  </span>
                  <Link
                    onDragStart={(e) => {
                      if (node.data.isRoot) e.preventDefault();
                    }}
                    title={node.data.namePath}
                    href={node.data.isFile ? "/file/" + node.id : "/files/" + node.id}
                    className="mr-[6px] flex-shrink-0"
                  >
                    {node.isOpen ? (
                      <FaFolderOpen size={iconSize} color={folderColor} />
                    ) : (
                      <FaFolder size={iconSize} color={folderColor} />
                    )}
                  </Link>
                </>
              )}
              {/*           <span className={cn("cursor-grab", node.isEditing && "border-black border")}>
               */}
              <Link
                onDragStart={(e) => {
                  if (node.data.isRoot) e.preventDefault();
                }}
                title={node.data.namePath}
                href={node.data.isFile ? "/file/" + node.id : "/files/" + node.id}
                className={cn("truncate flex-grow", !node.data.parentId ? "cursor-pointer" : "cursor-grab")}
              >
                {node.data.name}
              </Link>
              <div className={cn(isMobile ? "" : "action-button")}>
                <ActionDropdown
                  nodeData={node.data}
                  DropdownTriggerComponent={DropdownMenuTrigger}
                  dropdownTriggerProps={{
                    asChild: true,
                    children: (
                      <Button variant="none" className="flex h-4 w-4 p-0 bg-transparent">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    ),
                  }}
                />
              </div>
            </div>
            <ContextMenuContent hideWhenDetached={true} className="w-[160px] flex flex-col">
              <MenuHeader title={node.data.name} icon={CustomIcon} />
              {menuItems.map((item, index) => {
                // Check the condition - if it's true, return null (nothing will be rendered)
                if (item.label === "Move" && !node.data.parentId) {
                  return null;
                }
                if (node.data.isFile && (item.label === "Upload files" || item.label === "Add a subfolder")) {
                  return null;
                }
                if (item.label === "Rename" && nodeData.isRoot) {
                  return null;
                }

                // If the condition is not met, render the DropdownMenuItem as usual
                return (
                  <ContextMenuItem
                    key={index}
                    className={cn(item.differentClassName ? item.differentClassName : "font-normal text-primary/90")}
                    onClick={item.action}
                  >
                    {item.label === "Move" && !node.data.isFile ? (
                      <FolderInput className={iconClassName} />
                    ) : (
                      <item.icon className={iconClassName} />
                    )}
                    {item.label}
                  </ContextMenuItem>
                );
              })}
              {/* {onConfirmFunc && <DeletePopover onConfirmFunc={onConfirmFunc} />} */}
            </ContextMenuContent>
          </ContextMenuTrigger>
        </ContextMenu>
      )}
    </div>
  );
};

export default Node;
