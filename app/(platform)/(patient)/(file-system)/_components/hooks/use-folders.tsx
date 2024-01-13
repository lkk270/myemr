import { create } from "zustand";
import { toast } from "sonner";
import { SingleLayerNodesType2 } from "@/app/types/file-types";

interface FolderStore {
  folders: any[];
  singleLayerNodes: SingleLayerNodesType2[];
  singleLayerNodesSet: boolean;
  foldersSet: boolean;
  setSingleLayerNodes: (nodes: SingleLayerNodesType2[]) => void;
  setFolders: (folders: any[]) => void;
  updateNodeName: (nodeId: string, newName: string) => void;
}

export const useFolderStore = create<FolderStore>((set, get) => ({
  folders: [],
  singleLayerNodes: [],
  singleLayerNodesSet: false,
  foldersSet: false,
  setSingleLayerNodes: (singleLayerNodes) => set({ singleLayerNodes, singleLayerNodesSet: true }),
  setFolders: (folders) => set({ folders, foldersSet: true }),
  updateNodeName: (nodeId, newName) => {
    const findFolderById = (folders: any[], id: string): any | null => {
      for (let folder of folders) {
        if (folder.id === id) {
          return folder;
        }
        if (folder.children) {
          const found: any | null = findFolderById(folder.children, id);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    const updateChildrenNamePath = (children: any[], oldPath: string, newPath: string) => {
      children.forEach((childNode) => {
        childNode.namePath = childNode.namePath.replace(oldPath, newPath);
        if (!childNode.isFile && childNode.children) {
          updateChildrenNamePath(childNode.children, oldPath, newPath);
        }
      });
    };

    const updateFolders = (folders: any[], nodeId: string, newName: string) => {
      return folders.map((folder) => {
        if (folder.id === nodeId) {
          const oldPath = folder.namePath;
          folder.name = newName;

          // Update namePath for files and folders differently
          if (folder.isFile) {
            // For files, replace only the file name in the namePath
            folder.namePath = oldPath.replace(/[^/]*$/, newName);
          } else {
            // For folders, update the entire path
            folder.namePath = oldPath.split("/").slice(0, -1).concat(newName).join("/");
            if (folder.children) {
              const newPath = folder.namePath;
              updateChildrenNamePath(folder.children, oldPath, newPath);
            }
          }
        } else if (folder.children) {
          // Recursively update children folders
          folder.children = updateFolders(folder.children, nodeId, newName);
        }
        return folder;
      });
    };

    set((state) => {
      const folderToUpdate = state.singleLayerNodes.find((node) => node.id === nodeId);
      if (!folderToUpdate) {
        toast.error(`Node with id ${nodeId} not found`);
        return { ...state };
      }

      const oldPath = folderToUpdate.namePath;
      const newPath = oldPath.split("/").slice(0, -1).concat(newName).join("/");

      if (state.singleLayerNodes.some((node) => node.namePath === newPath)) {
        toast.error(`A node with the namePath '${newPath}' already exists.`);
        return { ...state };
      }

      const updatedFolders = updateFolders(state.folders, nodeId, newName);
      let updatedNode = null;
      const updatedSingleLayerNodes = state.singleLayerNodes.filter((node) => {
        if (node.id === nodeId) {
          updatedNode = { ...node, name: newName, namePath: newPath };
          return false; // Exclude this node from the filtered array
        } else if (node.namePath.startsWith(oldPath + "/")) {
          return { ...node, namePath: node.namePath.replace(oldPath, newPath) };
        }
        return node;
      });
      if (updatedNode) {
        updatedSingleLayerNodes.unshift(updatedNode);
      }
      console.log(updatedFolders);
      console.log(updatedSingleLayerNodes);
      return { ...state, folders: updatedFolders, singleLayerNodes: updatedSingleLayerNodes };
    });
  },
}));
