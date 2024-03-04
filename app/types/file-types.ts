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
  size?: number;
  restricted?: boolean;
};

export type NodeData2Type = {
  id: string;
  name: string;
  path: string;
  namePath: string;
  isFile: boolean;
  isRoot?: boolean;
  type?: string;
  size?: number;
  createdAt: Date;
};

type SingleLayerNodeBaseType = {
  id: string;
  name: string;
  path: string;
  namePath: string;
  isFile: boolean;
  parentId?: string | null;
  type?: string;
  size?: bigint;
  isRoot?: boolean;
  createdAt: Date;
  addedByUserId?: string | null;
  addedByName: string;
  userId: string;
  patientProfileId: string;
  updatedAt: Date;
  children?: undefined;
};

export type SingleLayerNodesType = SingleLayerNodeBaseType & {
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
  type?: string;
  size?: bigint;
  isRoot?: boolean;
  createdAt?: Date;
  addedByUserId?: string | null;
  addedByName: string;
  userId: string;
  patientProfileId: string;
  restricted?: boolean;
  updatedAt?: Date;
  children?: undefined | any[];
};

export type MenuItemData = {
  label: string;
  icon: LucideIcon;
  action: () => void;
  differentClassName?: string;
  isFile?: boolean;
};

export type FileWithStatus = {
  file: File;
  status?: "waiting" | "uploading" | "uploaded" | "error" | "canceled" | "gotPSU" | null;
  isRetrying?: boolean;
  controller: AbortController;
  insuranceSide?: "front" | "back";
};

export type FolderNameType = { name: string; namePath: string };
