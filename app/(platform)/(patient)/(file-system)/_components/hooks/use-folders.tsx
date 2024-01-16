import { create } from "zustand";
import { toast } from "sonner";
import { SimpleNodeType, SingleLayerNodesType2 } from "@/app/types/file-types";
import { sortFolderChildren } from "@/lib/utils";
import _ from "lodash";

interface FolderStore {
  folders: any[];
  singleLayerNodes: SingleLayerNodesType2[];
  singleLayerNodesSet: boolean;
  foldersSet: boolean;
  setSingleLayerNodes: (nodes: SingleLayerNodesType2[]) => void;
  setFolders: (folders: any[]) => void;
  updateNodeName: (nodeId: string, newName: string) => void;
  moveNodes: (selectedNodeIds: string[], targetNodeId: string) => void;
}

const getAllChildrenIds = (node: any, allNodes: any[]): Set<string> => {
  const childrenIds = new Set<string>();
  if (node.children) {
    for (const child of node.children) {
      childrenIds.add(child.id);
      const childChildrenIds = getAllChildrenIds(child, allNodes);
      childChildrenIds.forEach((id) => childrenIds.add(id));
    }
  }
  return childrenIds;
};

const isChildOfSelectedNode = (
  node: any,
  selectedNodeIds: Set<string>,
  allNodes: any[],
  visitedNodeIds: Set<string> = new Set(),
): boolean => {
  if (selectedNodeIds.has(node.id)) {
    return true;
  }
  if (node.parentId && !visitedNodeIds.has(node.id)) {
    visitedNodeIds.add(node.id);
    const parentNode = allNodes.find((n) => n.id === node.parentId);
    return parentNode ? isChildOfSelectedNode(parentNode, selectedNodeIds, allNodes, visitedNodeIds) : false;
  }
  return false;
};

const updateNodePaths = (
  node: any,
  newPath: string,
  newParentPath: string,
  newParentId: string | null,
  selectedNodeIds: Set<string>,
  allNodes: any[],
): void => {
  if (selectedNodeIds.has(node.id) || isChildOfSelectedNode(node, selectedNodeIds, allNodes)) {
    node.parentId = newParentId;
    node.namePath = `${newPath}/${node.name}`;
    node.path = newParentPath;

    if (node.children) {
      node.children.forEach((childNode: any) => {
        updateNodePaths(childNode, node.namePath, node.path, node.id, selectedNodeIds, allNodes);
      });
    }
  }
};

const updateFolderAndChildren = (folder: any, targetNode: any, selectedNodeMap: Map<string, any>) => {
  let updatedFolder = { ...folder };

  // Update the folder if it is one of the selected nodes

  if (selectedNodeMap.has(folder.id)) {
    const selectedNode = selectedNodeMap.get(folder.id);
    updatedFolder = {
      ...updatedFolder,
      parentId: targetNode.id,
      path: `${targetNode.path}${targetNode.id}/`,
      namePath: `${targetNode.namePath}/${selectedNode.name}`,
    };
  }

  // Remove the selected nodes from their original children array

  if (folder.children) {
    updatedFolder.children = folder.children
      .filter((child: any) => !selectedNodeMap.has(child.id))
      .map((child: any) => updateFolderAndChildren(child, targetNode, selectedNodeMap));
  }

  return updatedFolder;
};

const insertIntoFolder = (folder: any, node: any, targetNodeId: string) => {
  if (folder.id === targetNodeId) {
    if (!folder.isFile) {
      const updatedNode = {
        ...node,
        parentId: targetNodeId,
        path: `${folder.path}${folder.id}/`,
        namePath: `${folder.namePath}/${node.name}`,
      };
      return { ...folder, children: [...folder.children, updatedNode] };
    } else {
      console.error("Cannot insert a node into a file.");
      return folder;
    }
  } else if (folder.children) {
    // Recursive call uses the original node, not updatedNode
    return {
      ...folder,
      children: folder.children.map((child: any) => insertIntoFolder(child, node, targetNodeId)),
    };
  }
  return folder;
};

const updateNodePathsForFolder = (node: any, newPath: string, newParentPath: string) => {
  // Clone the node to avoid direct state mutation
  let updatedNode = { ...node, path: newParentPath, namePath: newPath };
  // Recursively update paths for children if it's a folder
  if (!node.isFile && node.children) {
    updatedNode.children = node.children.map((childNode: any) => {
      const childNewPath = `${newPath}/${childNode.name}`;
      const childNewParentPath = `${newParentPath}${node.id}/`;
      return updateNodePathsForFolder(childNode, childNewPath, childNewParentPath);
    });
  }

  return updatedNode;
};

// Utility function to find a node in the folders array
const findNodeInFolders = (folders: any[], nodeId: string): any | null => {
  for (const folder of folders) {
    if (folder.id === nodeId) {
      return folder;
    }
    if (folder.children) {
      const foundNode = findNodeInFolders(folder.children, nodeId);
      if (foundNode) {
        return foundNode;
      }
    }
  }
  return null;
};

export const useFolderStore = create<FolderStore>((set, get) => ({
  folders: [],
  singleLayerNodes: [],
  singleLayerNodesSet: false,
  foldersSet: false,
  setSingleLayerNodes: (singleLayerNodes) => set({ singleLayerNodes, singleLayerNodesSet: true }),
  setFolders: (folders) => set({ folders, foldersSet: true }),

  moveNodes: (selectedIds: string[], targetNodeId: string) => {
    console.log(selectedIds);
    console.log(targetNodeId);
    set((state) => {
      // Retrieve the complete node information from the folders array
      const selectedNodesInfo: any[] = []; // Replace 'any' with your node type if defined
      const findSelectedNodes = (folders: any[], ids: Set<string>) => {
        folders.forEach((folder) => {
          if (ids.has(folder.id)) {
            selectedNodesInfo.push(_.cloneDeep(folder));
          }
          if (folder.children) {
            findSelectedNodes(folder.children, ids);
          }
        });
      };
      findSelectedNodes(state.folders, new Set(selectedIds));

      const targetNode = findNodeInFolders(state.folders, targetNodeId);
      if (!targetNode) {
        toast.error(`Target node with id ${targetNodeId} not found`);
        return { ...state };
      }

      const selectedNodeMap = new Map(selectedNodesInfo.map((node) => [node.id, node]));

      // Update folders by removing original references of moved nodes and updating paths
      let updatedFolders = state.folders.map((folder) => updateFolderAndChildren(folder, targetNode, selectedNodeMap));

      // Insert the nodes into the new location and update their paths
      selectedNodeMap.forEach((node, nodeId) => {
        const newPath = `${targetNode.namePath}/${node.name}`;
        const newParentPath = `${targetNode.path}${targetNode.id}/`;
        const updatedNode = updateNodePathsForFolder(node, newPath, newParentPath);

        updatedFolders = updatedFolders.map((folder) => insertIntoFolder(folder, updatedNode, targetNodeId));
      });

      // Extract all nodes from the updated folders array
      let allUpdatedNodes: any[] = [];
      const extractNodes = (folders: any[]) => {
        folders.forEach((folder) => {
          allUpdatedNodes.push(folder);
          if (folder.children) {
            extractNodes(folder.children);
          }
        });
      };
      extractNodes(updatedFolders);

      // Create a map for quick lookup
      const updatedNodeMap = new Map(allUpdatedNodes.map((node) => [node.id, { ...node, children: undefined }]));

      // Update the singleLayerNodes array
      const updatedSingleLayerNodes = state.singleLayerNodes.map((node) => {
        if (updatedNodeMap.has(node.id)) {
          return updatedNodeMap.get(node.id);
        }
        return node;
      });

      console.log(updatedSingleLayerNodes);

      const selectedNodes = updatedSingleLayerNodes.filter((node) => selectedIds.includes(node.id));

      // Filter out the non-selected nodes
      const nonSelectedNodes = updatedSingleLayerNodes.filter((node) => !selectedIds.includes(node.id));

      // Concatenate the selected nodes at the beginning and the non-selected nodes
      const finalUpdatedSingleLayerNodes = selectedNodes.concat(nonSelectedNodes);

      console.log(updatedFolders);
      console.log(finalUpdatedSingleLayerNodes);
      const sortedFolders = updatedFolders.map((folder) => sortFolderChildren(folder));

      return {
        ...state,
        singleLayerNodes: finalUpdatedSingleLayerNodes,
        folders: sortedFolders,
      };
    });
  },

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

      // if (state.singleLayerNodes.some((node) => node.namePath === newPath)) {
      //   toast.error(`A node with the namePath '${newPath}' already exists.`);
      //   return { ...state };
      // }

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
      const sortedFolders = updatedFolders.map((folder) => sortFolderChildren(folder));

      console.log(updatedFolders);
      console.log(updatedSingleLayerNodes);
      return { ...state, folders: sortedFolders, singleLayerNodes: updatedSingleLayerNodes };
    });
  },
}));