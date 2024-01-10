import { create } from "zustand";
import { NodeData2Type } from "@/app/types/file-types";

interface FolderStore {
  folders: any[];
  singleLayerNodes: NodeData2Type[];
  singleLayerNodesSet: boolean;
  foldersSet: boolean;
  setSingleLayerNodes: (nodes: any[]) => void;
  setFolders: (folders: any[]) => void;
}

export const useFolderStore = create<FolderStore>((set, get) => ({
  folders: [],
  singleLayerNodes: [],
  singleLayerNodesSet: false,
  foldersSet: false,
  setSingleLayerNodes: (singleLayerNodes) => set({ singleLayerNodes, singleLayerNodesSet: true }),
  setFolders: (folders) => set({ folders, foldersSet: true }),
}));
