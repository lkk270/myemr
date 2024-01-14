import React from "react";
import { SimpleNodeType } from "@/app/types/file-types";

type DragContextType = {
  hoveredNode: SimpleNodeType;
  setHoveredNode: (node: SimpleNodeType) => void;
  draggedNode: SimpleNodeType;
  setDraggedNode: (node: SimpleNodeType) => void;
  hoveredFolderId: string | null;
  setHoveredFolderId: (id: string | null) => void;
  contextDisableDrop: boolean | null;
  setContextDisableDrop: (disable: boolean) => void;
};

const DragContext = React.createContext<DragContextType>({
  hoveredNode: { id: null, parentId: null, path: null, namePath: null, isFile: null },
  setHoveredNode: () => {},
  draggedNode: { id: null, parentId: null, path: null, namePath: null, isFile: null },
  setDraggedNode: () => {},
  hoveredFolderId: null,
  setHoveredFolderId: () => {},
  contextDisableDrop: null,
  setContextDisableDrop: () => {},
});

export default DragContext;
