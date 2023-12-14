import React, { useRef, useState } from "react";
import { Tree } from "react-arborist";
import { data } from "../_data/data";
import Node from "./node";
import { TbFolderPlus } from "react-icons/tb";
import { AiOutlineFileAdd } from "react-icons/ai";
import DragContext from "./drag-context";

const Arborist: React.FC = () => {
  const [term, setTerm] = useState<string>("");
  const treeRef = useRef<any>(null); // Replace 'any' with the appropriate type
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

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
    <DragContext.Provider value={{ hoveredNodeId, setHoveredNodeId }}>
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
          ref={treeRef}
          disableMultiSelection={false}
          initialData={data}
          width={300}
          height={1000}
          indent={24}
          rowHeight={32}
          searchTerm={term}
          searchMatch={(node, term) => node.data.name.toLowerCase().includes(term.toLowerCase())}
        >
          {Node as any}
        </Tree>
      </div>
    </DragContext.Provider>
  );
};

export default Arborist;
