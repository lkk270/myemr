export type SimpleNodeType = {
  id: string | null;
  parentId: string | null;
  path: string | null;
  isFile: boolean | null;
};

export type NodeDataType = {
  id: string;
  name: string;
  parentId: string;
  path: string;
  namePath: string;
  isFile: boolean;
};

export type NodeData2Type = {
  id: string;
  name: string;
  path: string;
  namePath: string;
  isFile: boolean;
};
