import React, { useRef, useState, useEffect } from "react";
import { Tree } from "react-arborist";
import { data } from "../_data/data";
import Node from "./node";
import { TbFolderPlus } from "react-icons/tb";
import { AiOutlineFileAdd } from "react-icons/ai";
import DragContext from "./drag-context";
import { File, FolderClosed } from "lucide-react";

const CustomCursor = () => null;

const customDragPreview = ({ offset, mouse, id, dragIds, isDragging }: any, tree: any) => {
  if (!isDragging || !mouse || !tree) return null;
  if (tree.isDragging("c4-1-1-14")) {
    console.log("TRUE");
  } else {
    console.log("FALSE");
  }

  const selectedIds = Array.from(tree.selectedIds);
  const numberOfSelectedIds = selectedIds.length;
  const baseZIndex = 1000;
  const baseStyle: React.CSSProperties = {
    position: "fixed",
    pointerEvents: "none",
    boxShadow: "3px 3px 6px rgba(0, 0, 0, 0.6)",
    backgroundColor: "rgba(79, 94, 255, 0.8)",
    color: "white",
    padding: "2px",
    paddingLeft: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "left",
    fontSize: "11px",
    fontFamily: "Arial, sans-serif",
    zIndex: baseZIndex,
    width: "125px",
    height: "35px",
  };

  const getItemData = (itemId: string) => {
    const itemData = itemId ? tree.get(itemId).data : null;
    const name = itemData && itemData.name ? itemData.name : "";
    const isFile = itemData && itemData.isFile;
    return { name, isFile };
  };

  const truncateName = (name: string) => {
    return name.length > 15 ? `${name.substring(0, 15)}...` : name;
  };

  const renderIconAndName = (isFile: boolean | null, name: string) => (
    <>
      {isFile ? <File className="w-4 h-4 pr-1" /> : <FolderClosed className="w-4 h-4 pr-1" />}
      <span>{name}</span>
    </>
  );

  const badgeStyle: React.CSSProperties = {
    backgroundColor: "red",
    borderRadius: "50%",
    color: "white",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: "-10px",
    right: "-10px",
    fontSize: "12px",
  };

  if (numberOfSelectedIds <= 1) {
    const { name, isFile } = getItemData(id);
    const truncatedName = truncateName(name);

    return (
      <div style={{ ...baseStyle, left: mouse.x + "px", top: mouse.y + "px" }}>
        {renderIconAndName(isFile, truncatedName)}
      </div>
    );
  }

  const stackedItems = selectedIds.map((selectedId, index) => {
    const { name, isFile } = getItemData(selectedId as string);
    const truncatedName = truncateName(name);
    const itemStyle = {
      ...baseStyle,
      left: mouse.x + 5 * index + "px",
      top: mouse.y + 5 * index + "px",
      zIndex: baseZIndex - index,
    };

    return (
      <div key={index} style={itemStyle}>
        {index === 0 && (
          <>
            {renderIconAndName(isFile, truncatedName)}
            <div style={badgeStyle}>{numberOfSelectedIds}</div>
          </>
        )}
      </div>
    );
  });

  return <div>{stackedItems}</div>;
};

const Arborist: React.FC = () => {
  // const [treeInstance, setTreeInstance] = useState<any>(null);

  const [term, setTerm] = useState<string>("");
  const treeRef = useRef<any>(null); // Replace 'any' with the appropriate type

  // // Update the ref callback
  // useEffect(() => {
  //   setTreeInstance(treeRef.current);
  // }, []);

  const customDragPreviewWithTree = (props: any) => {
    if (!treeRef.current) {
      console.warn("Tree instance not available");
      return null;
    }
    return customDragPreview(props, treeRef.current);
  };

  // const customDragPreviewWithTree = (props: any) => customDragPreview(props, treeInstance);

  const [hoveredNode, setHoveredNode] = useState<{
    id: string | null;
    parentId: string | null;
    path: string | null;
    isFile: boolean | null;
  }>({
    id: null,
    parentId: null,
    path: null,
    isFile: null,
  });
  const [draggedNode, setDraggedNode] = useState<{
    id: string | null;
    parentId: string | null;
    path: string | null;
    isFile: boolean | null;
  }>({
    id: null,
    parentId: null,
    path: null,
    isFile: null,
  });
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);
  const [contextDisableDrop, setContextDisableDrop] = useState(false);
  const disableDrop = ({ parentNode, dragNodes, index }: any) => {
    // Check if any of the dragged nodes are files and if they are being dropped into a folder
    const isDroppingFileIntoFolder = dragNodes.some(
      (dragNode: any) => dragNode.data.isFile && (!parentNode || !parentNode.data.children),
    );

    // Check if any of the dragged nodes have the same parent as the target parentNode
    // This will prevent reordering within the same folder but allow dropping into subfolders
    const isReorderingInSameFolder = dragNodes.some((dragNode: any) => dragNode.parent.id === parentNode.id);
    setContextDisableDrop(isDroppingFileIntoFolder || isReorderingInSameFolder);
    // Disable drop if either of the conditions are met
    return isDroppingFileIntoFolder || isReorderingInSameFolder || !hoveredNode.id;
  };

  const createFileFolder = (
    <div className="flex gap-2">
      <button
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 cursor-pointer"
        onClick={() => treeRef.current.createInternal()}
        title="New Folder..."
      >
        <TbFolderPlus />
      </button>
      <button
        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 cursor-pointer"
        onClick={() => treeRef.current.createLeaf()}
        title="New File..."
      >
        <AiOutlineFileAdd />
      </button>
    </div>
  );

  return (
    <DragContext.Provider
      value={{
        hoveredNode,
        setHoveredNode,
        draggedNode,
        setDraggedNode,
        hoveredFolderId,
        setHoveredFolderId,
        contextDisableDrop,
        setContextDisableDrop,
      }}
    >
      <div className="max-w-[300px] flex flex-col gap-4 min-h-full p-5">
        <div className="flex justify-between items-center">
          {createFileFolder}
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
        <Tree
          renderCursor={CustomCursor}
          renderDragPreview={customDragPreviewWithTree}
          ref={treeRef}
          disableMultiSelection={false}
          // openByDefault={false}
          initialData={data}
          width={300}
          height={500}
          indent={24}
          rowHeight={32}
          searchTerm={term}
          disableDrop={disableDrop}
          disableDrag={draggedNode.parentId === "-1"}
          searchMatch={(node, term) => node.data.name.toLowerCase().includes(term.toLowerCase())}
        >
          {Node as any}
        </Tree>
      </div>
    </DragContext.Provider>
  );
};

export default Arborist;
