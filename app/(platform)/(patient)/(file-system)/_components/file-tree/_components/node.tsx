import React, { useState, useEffect } from "react";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import {
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  FolderInput,
  FileInput,
  Download,
  Trash,
  File,
  FolderClosed,
  LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";
import DragContext from "./drag-context";
import { cn, getFileIcon } from "@/lib/utils";
import { useDeleteModal } from "./hooks/use-delete-file-modal";
import { useDownloadModal } from "./hooks/use-download-modal";
import { useRenameModal } from "./hooks/use-rename-modal";
import { useMoveModal } from "./hooks/use-move-modal";
import { useMediaQuery } from "usehooks-ts";
import { useSearch } from "@/app/(platform)/(patient)/(file-system)/_components/hooks/use-search";
import { useFolderStore } from "../../hooks/use-folders";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Assuming a Node type is defined somewhere
// If not, you'll need to define it accordingly
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { NodeDataType } from "@/app/types/file-types";

interface NodeData {
  id: string;
  name: string;
  icon?: IconType;
  iconColor?: string;
  children?: NodeData[];
}

type NodeProps = {
  node: any;
  style: React.CSSProperties;
  dragHandle: any; // Replace 'any' with the appropriate type
  tree: any; // Replace 'any' with the appropriate type
};

interface MenuItemData {
  label: string;
  icon: LucideIcon;
  action: () => void;
  differentClassName?: string;
  isFile?: boolean;
}

interface MenuHeaderProps {
  title: string;
  icon: IconType;
}

interface HandleMenuItemClickParams {
  node: any; // Replace 'any' with the specific type of your node
  setContextEditClicked: (value: boolean) => void;
  action: () => void;
}

// Reusable menu item component
const MenuHeader = ({ title, icon: Icon }: MenuHeaderProps) => (
  <div className="flex justify-center py-1 overflow-hidden">
    <div className="flex items-center text-sm text-muted-foreground max-w-full">
      <Icon size={iconSize} color={folderColor} className="w-4 h-4 mr-2 flex-shrink-0" />
      <div className="truncate flex-1">{title}</div>
    </div>
  </div>
);

// Common function for handling menu item clicks

const iconSize = "17px";
const folderColor = "#4f5eff";
const iconClassName = "w-3 h-3 mr-2";

const Node: React.FC<NodeProps> = ({ node, style, dragHandle, tree }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [contextEditClicked, setContextEditClicked] = useState(false);
  const isMobile = useMediaQuery("(max-width: 450px)");
  const [contextEditClickedTime, setContextEditClickedTime] = useState(0);
  const deleteModal = useDeleteModal();
  const downloadModal = useDownloadModal();
  const renameModal = useRenameModal();
  const moveModal = useMoveModal();
  const foldersStore = useFolderStore();
  const pathname = usePathname();
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

  // useEffect(() => {
  //   setIsMounted(true);
  // }, []);

  // if (!isMounted) {
  //   return null;
  // }

  const menuItems: MenuItemData[] = [
    {
      label: "Rename",
      icon: Pencil,
      action: () => renameModal.onOpen(customNodeData),
    },
    {
      label: "Move",
      icon: FileInput,
      isFile: true,
      action: () => {
        moveModal.onOpen(customNodeData);
      },
    },
    {
      label: "Export",
      icon: Download,
      action: () => downloadModal.onOpen(customNodeData),
    },
    {
      label: "Delete",
      icon: Trash,
      action: () => deleteModal.onOpen(customNodeData),
      differentClassName: "font-normal text-red-400 focus:text-red-500",
    },
  ];

  useEffect(() => {
    setIsMounted(true);
    if (tree) {
      tree.openParents(nodeIdFromPath);
      if (!tree.get(nodeIdFromPath).data.isFile) {
        tree.open(nodeIdFromPath);
      }
    }
  }, [tree, node]); // Add dependencies here

  const CustomIcon = node.data.isFile ? getFileIcon(node.data.name) : FaFolder;

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
    console.log("DONE");
    console.log(hoveredNode);
    console.log(tree.selectedIds);
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
              onClick={() => node.isInternal && node.toggle()}
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
                  <span className="mr-2 flex-shrink-0">
                    {node.isOpen ? <ChevronDown size={iconSize} /> : <ChevronRight size={iconSize} />}
                  </span>
                  <span className="mr-[6px] flex-shrink-0">
                    {node.isOpen ? (
                      <FaFolderOpen size={iconSize} color={folderColor} />
                    ) : (
                      <FaFolder size={iconSize} color={folderColor} />
                    )}
                  </span>
                </>
              )}
              {/*           <span className={cn("cursor-grab", node.isEditing && "border-black border")}>
               */}
              <span className={cn("truncate flex-grow", !node.data.parentId ? "cursor-default" : "cursor-grab")}>
                {node.isEditing ? (
                  <input
                    // className="border-black border"
                    type="text"
                    defaultValue={node.data.name}
                    onFocus={(e) => e.currentTarget.select()}
                    onBlur={(e) => {
                      if (!contextEditClicked || Date.now() - contextEditClickedTime > 400) {
                        e.currentTarget.blur();
                        node.deselect();
                        node.reset();
                      } else {
                        e.currentTarget.select();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setContextEditClicked(false);
                        node.reset();
                      }
                      if (e.key === "Enter") {
                        setContextEditClicked(false);
                        node.submit(e.currentTarget.value);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <span>{node.data.name}</span>
                )}
              </span>
              <div className={cn(isMobile ? "" : "action-button")}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="none" className="flex h-4 w-4 p-0 bg-transparent">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent hideWhenDetached={true} align="end" className="w-[160px] flex flex-col">
                    <MenuHeader title={node.data.name} icon={CustomIcon} />
                    {menuItems.map((item, index) => {
                      // Check the condition - if it's true, return null (nothing will be rendered)
                      if (item.label === "Move" && !node.data.parentId) {
                        return null;
                      }

                      // If the condition is not met, render the DropdownMenuItem as usual
                      return (
                        <DropdownMenuItem
                          key={index}
                          className={cn(
                            item.differentClassName ? item.differentClassName : "font-normal text-primary/90",
                          )}
                          onClick={() => {
                            node.toggle();
                            item.action();
                          }}
                        >
                          {item.label === "Move" && !node.data.isFile ? (
                            <FolderInput className={iconClassName} />
                          ) : (
                            <item.icon className={iconClassName} />
                          )}
                          {item.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <ContextMenuContent hideWhenDetached={true} className="w-[160px] flex flex-col">
              <MenuHeader title={node.data.name} icon={CustomIcon} />
              {menuItems.map((item, index) => {
                // Check the condition - if it's true, return null (nothing will be rendered)
                if (item.label === "Move" && !node.data.parentId) {
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
