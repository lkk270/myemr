import React, { useState, useEffect, useRef } from "react";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import { ChevronRight, ChevronDown, MoreHorizontal, GripVertical, Trash } from "lucide-react";
import DragContext from "./drag-context";
import { cn, getFileIcon } from "@/lib/utils";
import { useMediaQuery } from "usehooks-ts";
import { MenuHeader } from "./menu-header";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionDropdown } from "./action-dropdown";
import { useMenuItems } from "./hooks";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { NodeDataType } from "@/app/types/file-types";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { useFolderStore } from "../../hooks/use-folders";
import { usePathnameHook } from "./hooks/use-pathname";

type NodeProps = {
  node: any;
  style: React.CSSProperties;
  dragHandle: any; // Replace 'any' with the appropriate type
  tree: any; // Replace 'any' with the appropriate type
};

// Common function for handling menu item clicks

const iconSize = "17px";
const iconClassName = "w-4 h-4 mr-2";

const Node: React.FC<NodeProps> = ({ node, style, dragHandle, tree }) => {
  const currentUserPermissions = useCurrentUserPermissions();
  const [isMounted, setIsMounted] = useState(false);
  const folderStore = useFolderStore();
  const isMobile = useMediaQuery("(max-width: 450px)");
  const { setPrevPathnameVar, prevPathnameVar, pathnameVar } = usePathnameHook();

  const [nodeIdFromPath, setNodeIdFromPath] = useState("");
  // const hasMountedRef = useRef<boolean | null>(null);
  const router = useRouter();

  const isTrashNode = node.data.namePath === "/Trash";

  const folderColor = node.data.isRoot ? "#8d4fff" : "#4f5eff";

  const completeNodePath = node.data.isFile ? node.data.path : `${node.data.path}${node.data.id}/`;

  // const [isDragOver, setIsDragOver] = useState(false);
  const { hoveredNode, setHoveredNode, draggedNode, setDraggedNode, contextDisableDrop } =
    React.useContext(DragContext);

  const nodeData = node.data;
  const customNodeData: NodeDataType = {
    id: nodeData.id,
    name: nodeData.name,
    parentId: nodeData.parentId,
    path: nodeData.path,
    namePath: nodeData.namePath,
    isFile: nodeData.isFile,
  };

  const menuItems = useMenuItems(customNodeData);

  useEffect(() => {
    setIsMounted(true);
    // if (isTrashNode) {
    //   node.close();
    // }
  }, []);

  useEffect(() => {
    if (isTrashNode) {
      node.close();
    }
  }, [folderStore.folders]);

  // if (isMounted) {
  //   if (node.data.namePath !== "/Trash" && node.data.namePath.startsWith("/Trash")) {
  //     return null;
  //   }
  // }

  useEffect(() => {
    let newNodeIdFromPath = "";
    if (!pathnameVar) return;
    if (pathnameVar.includes("/files/")) {
      newNodeIdFromPath = pathnameVar.split("/files/")[1];
    } else if (pathnameVar.includes("/file/")) {
      newNodeIdFromPath = pathnameVar.split("/file/")[1];
    }
    const isPathNodeInTrash = folderStore.singleLayerNodes.some((node) => {
      return node.id === newNodeIdFromPath && node.namePath.startsWith("/Trash");
    });

    setNodeIdFromPath(newNodeIdFromPath);
    if (tree && prevPathnameVar !== pathnameVar) {
      setIsMounted(true);
      setPrevPathnameVar(pathnameVar);
      if (!isPathNodeInTrash) {
        tree.open(newNodeIdFromPath);
        tree.openParents(newNodeIdFromPath);
      }
      tree.deselectAll();
      // tree.select(newNodeIdFromPath);
    }
  }, [pathnameVar]);

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

  // useEffect(() => {
  //   // const trashNode = folderStore.singleLayerNodes.find((obj: SingleLayerNodesType2) => obj.namePath === "/Trash");
  //   if (prevPathnameRef.current !== pathname || hasMountedRef.current === null) {
  //     console.log(prevPathnameRef.current);
  //     console.log(pathname);
  //     console.log(pathname === prevPathnameRef.current);
  //     console.log(hasMountedRef.current);
  //     console.log(nodeIdFromPath);
  //     if (tree) console.log("IN HERE");
  //     const treeNode = tree.get(nodeIdFromPath);
  //     console.log(!!treeNode);
  //     // tree.openParents(nodeIdFromPath);
  //     if (tree && !!treeNode && !treeNode.data.namePath.startsWith("/Trash")) {
  //       console.log("IN HERE");
  //       tree.openParents(nodeIdFromPath);
  //       if (!tree.get(nodeIdFromPath)?.data.isFile) {
  //         tree.open(nodeIdFromPath);
  //       }
  //     }
  //     hasMountedRef.current = true;
  //     prevPathnameRef.current = pathname;
  //   }
  // }, [pathname]);

  // useEffect(() => {
  //   setIsMounted(true);
  // }, []);

  const CustomIcon = node.data.isFile ? getFileIcon(nodeData.type) : FaFolder;

  let isBackgroundChanged4 = false;
  if (
    draggedNode.id &&
    draggedNode.isFile &&
    completeNodePath.includes(hoveredNode.path) &&
    hoveredNode.path !== draggedNode.path &&
    hoveredNode.namePath !== "/Trash"
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
    hoveredNode.path !== draggedNode.path?.split("/" + draggedNode.id)[0] + "/" &&
    hoveredNode.namePath !== "/Trash"
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
    } else if (!node.data.isFile && !isTrashNode) {
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
  // if (node.data.namePath !== "/Trash" && node.data.namePath.startsWith("/Trash")) {
  //   return null;
  // }

  const nodeOnclick = () => {
    if (!tree.hasMultipleSelections) {
      router.push(node.data.isFile ? "/file/" + node.id : "/files/" + node.id);
    }
  };
  return (
    <div className={cn("px-2", isTrashNode && "pt-2")}>
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
                "truncate flex items-center flex-grow cursor-pointer",
                // !node.data.parentId ? "cursor-pointer" : "cursor-grab",
              )}
            >
              {node.data.isFile ? (
                <>
                  {currentUserPermissions.showActions && (
                    <GripVertical className={cn("action-button", "cursor-grab w-3 h-3 absolute left-3")} />
                  )}
                  <span className="w-5 flex-shrink-0 mr-1"></span>
                  <span className="mr-2 flex items-center flex-shrink-0">
                    <CustomIcon size={iconSize} />
                  </span>
                </>
              ) : (
                <>
                  {!node.data.isRoot && (
                    <GripVertical className={cn("action-button", "cursor-grab w-3 h-3 absolute left-3")} />
                  )}
                  {!isTrashNode && (
                    <span
                      className="mr-2 flex-shrink-0"
                      onClick={() => {
                        node.isInternal && node.toggle();
                      }}
                    >
                      {node.isOpen ? <ChevronDown size={iconSize} /> : <ChevronRight size={iconSize} />}
                    </span>
                  )}
                  <div
                    onDragStart={(e) => {
                      if (node.data.isRoot) e.preventDefault();
                    }}
                    onClick={nodeOnclick}
                    style={{
                      pointerEvents: tree.hasMultipleSelections > 1 ? "none" : "auto",
                    }}
                    className="mr-[6px] flex-shrink-0"
                  >
                    <div title={node.data.namePath}>
                      {isTrashNode ? (
                        <div className="pl-1">
                          <Trash size={"15px"} />
                        </div>
                      ) : node.isOpen ? (
                        <FaFolderOpen size={iconSize} color={folderColor} />
                      ) : (
                        <FaFolder size={iconSize} color={folderColor} />
                      )}
                    </div>
                  </div>
                </>
              )}
              {/*           <span className={cn("cursor-grab", node.isEditing && "border-black border")}>
               */}
              <div
                style={{
                  pointerEvents: tree.hasMultipleSelections ? "none" : "auto",
                }}
                onDragStart={(e) => {
                  if (node.data.isRoot) e.preventDefault();
                }}
                onClick={nodeOnclick}
                title={node.data.namePath}
                // href={node.data.isFile ? "/file/" + node.id : "/files/" + node.id}
                //!node.data.parentId ? "cursor-pointer" : "cursor-grab"
                className={cn("truncate flex-grow cursor-pointer")}
              >
                {node.data.name}
              </div>
              {!isTrashNode && currentUserPermissions.showActions && (
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
              )}
            </div>
            {!isTrashNode && currentUserPermissions.showActions && (
              <ContextMenuContent hideWhenDetached={true} className="w-[160px] flex flex-col">
                <MenuHeader title={node.data.name} icon={CustomIcon} />
                {menuItems.map((item, index) => {
                  // If the condition is not met, render the DropdownMenuItem as usual
                  return (
                    <ContextMenuItem
                      key={index}
                      className={cn(item.differentClassName ? item.differentClassName : "font-normal text-primary/90")}
                      onClick={item.action}
                    >
                      <item.icon className={iconClassName} />
                      {item.label}
                    </ContextMenuItem>
                  );
                })}
                {/* {onConfirmFunc && <DeletePopover onConfirmFunc={onConfirmFunc} />} */}
              </ContextMenuContent>
            )}
          </ContextMenuTrigger>
        </ContextMenu>
      )}
    </div>
  );
};

export default Node;
