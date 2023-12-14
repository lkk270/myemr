import React from "react";

type DragContextType = {
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
};

const DragContext = React.createContext<DragContextType>({
  hoveredNodeId: null,
  setHoveredNodeId: () => {},
});

export default DragContext;
