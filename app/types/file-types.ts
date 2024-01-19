import { LucideIcon } from "lucide-react";

export type SimpleNodeType = {
  id: string | null;
  parentId: string | null;
  path: string | null;
  namePath: string | null;
  isFile: boolean | null;
};

export type NodeDataType = {
  id: string;
  name: string;
  parentId: string;
  path: string;
  namePath: string;
  isFile: boolean;
  isRoot?: boolean;
};

export type NodeData2Type = {
  id: string;
  name: string;
  path: string;
  namePath: string;
  isFile: boolean;
  isRoot?: boolean;
};

export type SingleLayerNodesType = {
  id: string;
  name: string;
  path: string;
  namePath: string;
  isFile: boolean;
  lastViewedAt?: Date;
  parentId?: string | null;
  isRoot?: boolean;
  recordViewActivity: {
    lastViewedAt: Date;
  }[];
};

export type SingleLayerNodesType2 = {
  id: string;
  name: string;
  path: string;
  namePath: string;
  isFile: boolean;
  parentId?: string | null;
  lastViewedAt?: Date;
  isRoot?: boolean;
};

export type MenuItemData = {
  label: string;
  icon: LucideIcon;
  action: () => void;
  differentClassName?: string;
  isFile?: boolean;
};
