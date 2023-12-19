import React, { useState, useEffect } from "react";
import { AiFillFolder, AiFillFile } from "react-icons/ai";
import { MdArrowRight, MdArrowDropDown, MdEdit } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { IconType } from "react-icons";
import DragContext from "./drag-context";
import { cn } from "@/lib/utils";
// Assuming a Node type is defined somewhere
// If not, you'll need to define it accordingly
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

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

const Node: React.FC<NodeProps> = ({ node, style, dragHandle, tree }) => {
  const CustomIcon = node.data.icon;
  const iconColor = node.data.iconColor;
  const [contextEditClicked, setContextEditClicked] = useState(false);
  const [contextEditClickedTime, setContextEditClickedTime] = useState(0);
  if (tree.disableDropdown) {
    console.log("HELLO");
  }

  // const [isDragOver, setIsDragOver] = useState(false);
  const {
    hoveredNode,
    setHoveredNode,
    draggedNode,
    setDraggedNode,
    hoveredFolderId,
    setHoveredFolderId,
    contextDisableDrop,
  } = React.useContext(DragContext);
  const isBackgroundChanged =
    (node.id === hoveredFolderId || node.data.parentId === hoveredFolderId) &&
    draggedNode.parentId &&
    node.data.parentId &&
    draggedNode.parentId !== node.data.parentId;

  const isBackgroundChanged2 =
    (node.data.path?.includes(hoveredNode.path) || node.data.parentId?.includes(hoveredNode.path)) &&
    draggedNode.path &&
    draggedNode.path !== node.data.path &&
    draggedNode.parentId !== "-1" &&
    draggedNode.path !== node.data.path &&
    !contextDisableDrop &&
    ((!draggedNode.isFile && draggedNode.parentId !== node.data.parentId) ||
      (draggedNode.isFile && draggedNode.parentId !== node.data.parentId));

  const isBackgroundChanged3 = !contextDisableDrop;
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
      setHoveredFolderId(node.data.parentId); // Set the hoveredFolderId to the file's parentId
      setHoveredNode({
        id: node.data.id,
        parentId: node.data.parentId,
        path: node.data.path,
        isFile: node.data.isFile,
      });
    } else if (!node.data.isFile) {
      // If it's a folder
      setHoveredFolderId(node.id); // Set to the folder's id
      setHoveredNode({
        id: node.data.id,
        parentId: node.data.parentId,
        path: node.data.path,
        isFile: node.data.isFile,
      });
    }
  };

  const handleDragStart = () => {
    setDraggedNode({ id: node.id, parentId: node.data.parentId, path: node.data.path, isFile: node.data.isFile });
  };

  const handleDragEnd = () => {
    setDraggedNode({ id: null, parentId: null, path: null, isFile: null });
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
    setHoveredFolderId(null);
    setHoveredNode({ id: null, parentId: null, path: null, isFile: null });
  };
  return (
    <ContextMenu>
      <ContextMenuTrigger
        className={cn(
          "flex items-center w-full h-full node-container",
          node.state.isSelected && !node.state.isDragging && !node.isEditing && "bg-primary/10",
          // node.state.willReceiveDrop && node.id !== draggedNode.id && node.id !== draggedNode.parentId && "bg-blue-300",
          draggedNode.id &&
            node.id !== draggedNode.id &&
            node.id !== draggedNode.parentId &&
            isBackgroundChanged2 &&
            "bg-primary/10",
          // node.id.includes(draggedNode.parentId) &&
          //   node.id !== draggedNode.id &&
          //   node.id !== draggedNode.parentId &&
          //   "bg-blue-300",
        )}
        style={style}
        ref={dragHandle}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        // onDrop={handleDrop}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Node Content */}
        <div
          className="flex items-center cursor-pointer text-sm flex-grow"
          onClick={() => node.isInternal && node.toggle()}
        >
          {node.isLeaf ? (
            <>
              <span className="w-5"></span>
              <span className="mr-2 flex items-center">
                {CustomIcon ? <CustomIcon color={iconColor || "#6bc7f6"} /> : <AiFillFile color="#6bc7f6" />}
              </span>
            </>
          ) : (
            <>
              <span className="mr-2">{node.isOpen ? <MdArrowDropDown /> : <MdArrowRight />}</span>
              <span className="mr-2">
                {CustomIcon ? <CustomIcon color={iconColor || "#f6cf60"} /> : <AiFillFolder color="#f6cf60" />}
              </span>
            </>
          )}
          {/*           <span className={cn("cursor-grab", node.isEditing && "border-black border")}>
           */}
          <span className={cn("cursor-grab")}>
            {node.isEditing ? (
              <input
                // className="border-black border"
                type="text"
                defaultValue={node.data.name}
                onFocus={(e) => e.currentTarget.select()}
                onBlur={(e) => {
                  if (!contextEditClicked || Date.now() - contextEditClickedTime > 250) {
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
          {/* Action Buttons */}
          <div className="gap-x-2">
            <button className="cursor-pointer" onClick={() => node.edit()} title="Rename...">
              <MdEdit />
            </button>
            <button className="cursor-pointer" onClick={() => tree.delete(node.id)} title="Delete">
              <RxCross2 />
            </button>
          </div>
        </div>
        <ContextMenuContent className="w-64 z-[999999]">
          <ContextMenuItem
            inset
            onClick={() => {
              setContextEditClicked(true);
              setContextEditClickedTime(Date.now());
              node.edit();
            }}
          >
            Rename
            <ContextMenuShortcut>⌘[</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem inset onClick={() => tree.delete(node.id)}>
            Delete
            <ContextMenuShortcut>⌘]</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuTrigger>
    </ContextMenu>
  );
};

export default Node;
