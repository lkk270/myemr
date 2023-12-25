import React, { useRef, useState } from "react";
import { Tree } from "react-arborist";
import { data } from "../_data/data";
import Node from "./node";
import { TbFolderPlus } from "react-icons/tb";
import { AiOutlineFileAdd } from "react-icons/ai";
import DragContext from "./drag-context";

const CustomCursor = () => null;

const customDragPreview = ({ offset, mouse, id, dragIds, isDragging }: any) => {
  if (!isDragging || !mouse) return null;

  const style: React.CSSProperties = {
    // Use React.CSSProperties for correct typing
    position: "fixed",
    left: mouse.x + "px",
    top: mouse.y + "px",
    pointerEvents: "none", // TypeScript recognizes this as a valid value
    opacity: 0.8,
    // Add more styles as needed
  };

  // You can customize this further based on the node being dragged
  return <div style={style}>{dragIds.length > 1 ? `Dragging ${dragIds.length} items` : `Dragging: ${id}`}</div>;
};

const Arborist: React.FC = () => {
  const [term, setTerm] = useState<string>("");
  const treeRef = useRef<any>(null); // Replace 'any' with the appropriate type
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
          renderDragPreview={customDragPreview}
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
