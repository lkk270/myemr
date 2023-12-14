import React from "react";
import { AiFillFolder, AiFillFile } from "react-icons/ai";
import { MdArrowRight, MdArrowDropDown, MdEdit } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { IconType } from "react-icons";

// Assuming a Node type is defined somewhere
// If not, you'll need to define it accordingly

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
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary for onDrop to work
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    // Handle the drop logic here
    setIsDragOver(false);
  };

  return (
    <div
      className={`flex items-center w-full h-full node-container ${node.state.isSelected ? "isSelected" : ""} ${
        isDragOver ? "bg-blue-200" : ""
      }`}
      style={style}
      ref={dragHandle}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
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
        <span className="cursor-grab">
          {node.isEditing ? (
            <input
              type="text"
              defaultValue={node.data.name}
              onFocus={(e) => e.currentTarget.select()}
              onBlur={() => node.reset()}
              onKeyDown={(e) => {
                if (e.key === "Escape") node.reset();
                if (e.key === "Enter") node.submit(e.currentTarget.value);
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
    </div>
  );
};

export default Node;
