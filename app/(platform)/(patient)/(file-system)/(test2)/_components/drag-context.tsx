import React from "react";
import { SimpleNodeType } from "@/app/types/file-types";

type DragContextType = {
  hoveredNode: SimpleNodeType;
  setHoveredNode: (node: SimpleNodeType) => void;
  draggedNode: SimpleNodeType;
  setDraggedNode: (node: SimpleNodeType) => void;
};

const DragContext = React.createContext<DragContextType>({
  hoveredNode: { id: null, parentId: null },
  setHoveredNode: () => {},
  draggedNode: { id: null, parentId: null },
  setDraggedNode: () => {},
});

export default DragContext;
