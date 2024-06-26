import { create } from "zustand";
import { toast } from "sonner";
import { SingleLayerNodesType2 } from "@/app/types/file-types";
import {
  sortFolderChildren,
  sortRootNodes,
  extractNodes,
  addLastViewedAtAndSort,
  sortSingleLayerNodes,
} from "@/lib/utils";
import _ from "lodash";

interface FolderStore {
  folders: any[];
  singleLayerNodes: SingleLayerNodesType2[];
  singleLayerNodesSet: boolean;
  foldersSet: boolean;
  sumOfAllSuccessFilesSizes: bigint;
  updateLastViewedAt: (nodeId: string) => void;
  setSumOfAllSuccessFilesSizes: (newSumOfAllSuccessFilesSizes: bigint) => void;
  getDropdownFolders: () => { label: string; value: string; namePath: string }[];
  getNode: (nodeId: string) => SingleLayerNodesType2 | undefined;
  setSingleLayerNodes: (nodes: SingleLayerNodesType2[]) => void;
  setFolders: (folders: any[]) => void;
  updateNodeName: (nodeId: string, newName: string) => void;
  restoreRootNode: (selectedIds: string[]) => void;
  moveNodes: (selectedNodeIds: string[], targetNodeId: string) => void;
  deleteNode: (selectedNodeIds: string[], forEmptyTrash: boolean) => void;
  updateRestrictedStatus: (nodeIds: string[], newRestrictedValue: boolean) => void;
  addRootNode: (folderName: string, folderId: string, userId: string | null, userName: string) => void;
  addSubFolder: (
    folderId: string,
    folderName: string,
    parentId: string,
    path: string,
    namePath: string,
    userId: string,
    addedByUserId: string | null,
    addedByName: string,
  ) => void;
  addFile: (
    fileId: string,
    fileName: string,
    parentId: string,
    path: string,
    namePath: string,
    userId: string,
    uploadedByUserId: string | null,
    uploadedByName: string,
    type: string,
    size: bigint,
  ) => void;
}

const insertNewNode = (folders: any[], parentId: string, newNode: any): any => {
  return folders.map((folder) => {
    if (folder.id === parentId) {
      return { ...folder, children: [...folder.children, newNode] };
    } else if (folder.children) {
      return { ...folder, children: insertNewNode(folder.children, parentId, newNode) };
    } else {
      return folder;
    }
  });
};

export const useFolderStore = create<FolderStore>((set, get) => ({
  folders: [],
  singleLayerNodes: [],
  sumOfAllSuccessFilesSizes: BigInt(0),
  singleLayerNodesSet: false,
  foldersSet: false,
  getDropdownFolders() {
    const state = get();
    const folders = state.singleLayerNodes.filter((node) => !node.isFile && node.namePath !== "/Trash");
    folders.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    const items = folders.map((obj) => ({
      label: obj.name,
      value: obj.namePath,
      namePath: obj.namePath,
    }));
    return items;
  },
  getNode(nodeId) {
    const state = get(); // Access the current state using get()
    return state.singleLayerNodes.find((node) => node.id === nodeId);
  },

  setSingleLayerNodes: (singleLayerNodes) => set({ singleLayerNodes, singleLayerNodesSet: true }),
  setFolders: (folders) => set({ folders, foldersSet: true }),
  setSumOfAllSuccessFilesSizes: (sumOfAllSuccessFilesSizes) =>
    set({ sumOfAllSuccessFilesSizes: sumOfAllSuccessFilesSizes }),

  restoreRootNode: (selectedIds: string[]) => {
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

      const updateNodePathsForRoot = (node: any) => {
        // Update the node to have a root level path
        let updatedNode = { ...node, parentId: null, path: "/", namePath: `/${node.name}` };
        // Recursively update paths for children if it's a folder
        if (!node.isFile && node.children) {
          updatedNode.children = node.children.map((childNode: any) => {
            // Compute the new paths for the child based on the updated node
            const childNewPath = `/${node.name}/${childNode.name}`;
            // Directly use the updated node's path since the children are now at the root level too
            return updateNodePathsForRoot({ ...childNode, path: childNewPath, namePath: childNewPath });
          });
        }
        return updatedNode;
      };

      const insertNodeAtRoot = (node: any) => {
        // Directly insert the node at root level by updating its path and parent ID
        return updateNodePathsForRoot(node);
      };

      findSelectedNodes(state.folders, new Set(selectedIds));

      // Prepare selected nodes for restoration
      let updatedFolders = [...state.folders];
      const selectedNodeMap = new Map(selectedNodesInfo.map((node) => [node.id, node]));

      // Remove the nodes from their current location
      const removeSelectedNodes = (folders: any[], ids: Set<string>): any => {
        return folders
          .filter((folder) => !ids.has(folder.id)) // Remove the node if it's selected
          .map((folder) => ({
            ...folder,
            children: folder.children ? removeSelectedNodes(folder.children, ids) : [],
          }));
      };

      updatedFolders = removeSelectedNodes(updatedFolders, new Set(selectedIds));

      // Insert the nodes into the root level
      selectedNodeMap.forEach((node, nodeId) => {
        const updatedNode = insertNodeAtRoot(node);
        updatedFolders.push(updatedNode);
      });

      // Extract all nodes from the updated folders array
      let allUpdatedNodes: any[] = extractNodes(updatedFolders);

      // Create a map for quick lookup
      const updatedNodeMap = new Map(allUpdatedNodes.map((node) => [node.id, { ...node, children: undefined }]));

      // Update the singleLayerNodes array
      const updatedSingleLayerNodes = state.singleLayerNodes.map((node) => {
        if (updatedNodeMap.has(node.id)) {
          return updatedNodeMap.get(node.id);
        }
        return node;
      });

      // console.log(updatedSingleLayerNodes);

      const selectedNodes = updatedSingleLayerNodes.filter((node) => selectedIds.includes(node.id));

      // Filter out the non-selected nodes
      const nonSelectedNodes = updatedSingleLayerNodes.filter((node) => !selectedIds.includes(node.id));

      // Concatenate the selected nodes at the beginning and the non-selected nodes
      const finalUpdatedSingleLayerNodes = selectedNodes.concat(nonSelectedNodes);

      // console.log(allUpdatedNodes);
      // console.log(finalUpdatedSingleLayerNodes);
      const sortedFolders = sortRootNodes(updatedFolders);
      // console.log(sortedFolders);
      return {
        ...state,
        singleLayerNodes: finalUpdatedSingleLayerNodes,
        folders: sortedFolders,
      };
    });
  },

  moveNodes: (selectedIds: string[], targetNodeId: string) => {
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

      // Utility function to find a node in the folders array
      // const findNodeInFolders = (folders: any[], nodeId: string): any | null => {
      //   for (const folder of folders) {
      //     if (folder.id === nodeId) {
      //       return folder;
      //     }
      //     if (folder.children) {
      //       const foundNode = findNodeInFolders(folder.children, nodeId);
      //       if (foundNode) {
      //         return foundNode;
      //       }
      //     }
      //   }
      //   return null;
      // };

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

      findSelectedNodes(state.folders, new Set(selectedIds));

      // const targetNode = findNodeInFolders(state.folders, targetNodeId);
      const targetNode = state.getNode(targetNodeId);
      if (!targetNode) {
        toast.error(`Target node with id ${targetNodeId} not found`);
        return { ...state };
      }

      const selectedNodeMap = new Map(selectedNodesInfo.map((node) => [node.id, node]));

      // Update folders by removing original references of moved nodes and updating paths
      let updatedFolders = state.folders.map((folder) => updateFolderAndChildren(folder, targetNode, selectedNodeMap));
      const removeSelectedNodes = (folders: any[], ids: Set<string>): any => {
        return folders
          .filter((folder) => !ids.has(folder.id)) // Remove the node if it's selected
          .map((folder) => ({
            ...folder,
            children: folder.children ? removeSelectedNodes(folder.children, ids) : [],
          }));
      };

      updatedFolders = removeSelectedNodes(updatedFolders, new Set(selectedIds));

      // Insert the nodes into the new location and update their paths
      selectedNodeMap.forEach((node, nodeId) => {
        const newPath = `${targetNode.namePath}/${node.name}`;
        const newParentPath = `${targetNode.path}${targetNode.id}/`;
        const updatedNode = updateNodePathsForFolder(node, newPath, newParentPath);

        updatedFolders = updatedFolders.map((folder) => insertIntoFolder(folder, updatedNode, targetNodeId));
      });

      // Extract all nodes from the updated folders array
      let allUpdatedNodes: any[] = extractNodes(updatedFolders);

      // Create a map for quick lookup
      // console.log(allUpdatedNodes);
      const updatedNodeMap = new Map(allUpdatedNodes.map((node) => [node.id, { ...node, children: undefined }]));

      // console.log(updatedNodeMap);
      // Update the singleLayerNodes array
      const updatedSingleLayerNodes = state.singleLayerNodes.map((node) => {
        if (updatedNodeMap.has(node.id)) {
          return updatedNodeMap.get(node.id);
        }
        return node;
      });

      // console.log(updatedSingleLayerNodes);

      const selectedNodes = updatedSingleLayerNodes.filter((node) => selectedIds.includes(node.id));

      // Filter out the non-selected nodes
      const nonSelectedNodes = updatedSingleLayerNodes.filter((node) => !selectedIds.includes(node.id));

      // Concatenate the selected nodes at the beginning and the non-selected nodes
      const finalUpdatedSingleLayerNodes = selectedNodes.concat(nonSelectedNodes);

      // console.log(allUpdatedNodes);
      // console.log(finalUpdatedSingleLayerNodes);
      const sortedFoldersTemp = updatedFolders.map((folder) => sortFolderChildren(folder));
      const sortedFolders = sortRootNodes(sortedFoldersTemp);
      // console.log(sortedFolders);
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

      // console.log(updatedFolders);
      // console.log(updatedSingleLayerNodes);
      return { ...state, folders: sortedFolders, singleLayerNodes: updatedSingleLayerNodes };
    });
  },
  deleteNode: (selectedNodeIds, forEmptyTrash) => {
    set((state) => {
      const recursivelyDelete = (nodeId: string, nodes: any[], isRoot = true) => {
        return nodes.reduce((acc, node) => {
          if (node.id === nodeId) {
            // If forEmptyTrash is true, keep the node but remove its children
            if (forEmptyTrash && isRoot) {
              const { children, ...rest } = node; // Destructure to separate children from the rest
              acc.push(rest); // Push the node without children
              return acc;
            }
            // If forEmptyTrash is false or it's not the root, skip the node
            return acc;
          } else {
            // Keep the node, but check its children recursively
            if (node.children) {
              node.children = recursivelyDelete(nodeId, node.children, false);
            }
            acc.push(node);
            return acc;
          }
        }, []);
      };
      let newFolders = state.folders;

      for (const selectedNodeId of selectedNodeIds) {
        newFolders = recursivelyDelete(selectedNodeId, state.folders, true);
      }
      let rawAllNodes = extractNodes(newFolders);
      const allNodesMap = new Map(rawAllNodes.map((node) => [node.id, { ...node, children: undefined }]));
      const allNodesArray = Array.from(allNodesMap.values());
      const updatedSingleLayerNodes = addLastViewedAtAndSort(allNodesArray);

      return { ...state, folders: newFolders, singleLayerNodes: updatedSingleLayerNodes };
    });
  },

  addRootNode: (folderName: string, folderId: string, userId: string | null, userName: string) => {
    const id = Date.now().toString();
    set((state) => {
      const newNode = {
        id: folderId,
        name: folderName,
        path: "/",
        namePath: `/${folderName}`,
        isFile: false,
        isRoot: true,
        addedByUserId: userId,
        addedByName: userName,
        userId: "",
        patientProfileId: "",
        parentId: null,
        children: [],
        createdAt: new Date(),
        recordViewActivity: [{ lastViewedAt: new Date() }],
      };

      const newSingleLayerNode = {
        ...newNode,
        children: undefined,
        lastViewedAt: new Date(),
      };

      // Update folders state
      const updatedFolders = [...state.folders, newNode];
      const sortedFolders = sortRootNodes(updatedFolders);

      // Update singleLayerNodes state
      const updatedSingleLayerNodes = [newSingleLayerNode, ...state.singleLayerNodes];
      return {
        ...state,
        folders: sortedFolders,
        singleLayerNodes: updatedSingleLayerNodes,
      };
    });
  },
  addSubFolder: (
    folderId: string,
    folderName: string,
    parentId: string,
    path: string,
    namePath: string,
    userId: string,
    addedByUserId: string | null,
    addedByName: string,
  ) => {
    set((state) => {
      const newSubFolder = {
        id: folderId,
        name: folderName,
        path: path,
        namePath: namePath,
        isFile: false,
        isRoot: false,
        addedByUserId: addedByUserId,
        addedByName: addedByName,
        parentId: parentId,
        patientProfileId: "",
        children: [],
        userId: userId,
        createdAt: new Date(),
        recordViewActivity: [{ lastViewedAt: new Date() }],
      };

      const newSingleLayerNode = {
        ...newSubFolder,
        children: undefined,
        lastViewedAt: new Date(),
      };
      const updatedSingleLayerNodes = [newSingleLayerNode, ...state.singleLayerNodes];

      const updatedFolders = insertNewNode(state.folders, parentId, newSubFolder) as any[];

      // The singleLayerNodes array should be updated as well if necessary
      // You might need to adapt this part based on your application's logic
      const sortedFolders = updatedFolders.map((folder) => sortFolderChildren(folder));

      return {
        ...state,
        singleLayerNodes: updatedSingleLayerNodes,
        folders: sortedFolders,
      };
    });
  },
  addFile: (
    fileId: string,
    fileName: string,
    parentId: string,
    path: string,
    namePath: string,
    userId: string,
    uploadedByUserId: string | null,
    uploadedByName: string,
    type: string,
    size: bigint,
  ) => {
    set((state) => {
      const newFile = {
        id: fileId,
        name: fileName,
        path: path,
        namePath: namePath,
        isFile: true,
        isRoot: false,
        addedByUserId: uploadedByUserId,
        addedByName: uploadedByName,
        parentId: parentId,
        patientProfileId: "",
        userId: userId,
        type: type,
        size: size,
        children: null,
        createdAt: new Date(),
        recordViewActivity: [{ lastViewedAt: new Date() }],
      };

      const newSingleLayerNode = {
        ...newFile,
        children: undefined,
        lastViewedAt: new Date(),
      };
      const updatedSingleLayerNodes = [newSingleLayerNode, ...state.singleLayerNodes];

      const updatedFolders = insertNewNode(state.folders, parentId, newFile) as any[];

      // The singleLayerNodes array should be updated as well if necessary
      // You might need to adapt this part based on your application's logic
      const sortedFolders = updatedFolders.map((folder) => sortFolderChildren(folder));

      return {
        ...state,
        singleLayerNodes: updatedSingleLayerNodes,
        folders: sortedFolders,
      };
    });
  },

  updateLastViewedAt: (nodeId) => {
    // console.log("Updating lastViewedAt for nodeId:", nodeId); // Log the nodeId

    set((state) => {
      // First, update the node's lastViewedAt using map
      const updatedNodes = state.singleLayerNodes.map((node) =>
        node.id === nodeId ? { ...node, lastViewedAt: new Date() } : node,
      );

      // Then, sort the updated nodes array using your custom sort function
      const sortedNodes = sortSingleLayerNodes(updatedNodes);

      // Finally, return the sorted array to update the state
      return {
        singleLayerNodes: sortedNodes,
      };
    });
  },

  updateRestrictedStatus: (nodeIds: string[], newRestrictedValue: boolean) => {
    set((state) => {
      const nodeIdsSet = new Set(nodeIds);

      // Recursive function to update the restricted field in folders
      const updateFolders = (folders: any[]): any[] => {
        return folders.map((folder) => {
          if (nodeIdsSet.has(folder.id)) {
            folder = { ...folder, restricted: newRestrictedValue };
          }
          if (folder.children) {
            folder.children = updateFolders(folder.children);
          }
          return folder;
        });
      };

      // Update singleLayerNodes
      const updatedSingleLayerNodes = state.singleLayerNodes.map((node) => {
        if (nodeIdsSet.has(node.id)) {
          return { ...node, restricted: newRestrictedValue };
        }
        return node;
      });

      // Update folders
      const updatedFolders = updateFolders(state.folders);

      // Return the updated state
      return { ...state, folders: updatedFolders, singleLayerNodes: updatedSingleLayerNodes };
    });
  },
}));

// const getAllChildrenIds = (node: any, allNodes: any[]): Set<string> => {
//   const childrenIds = new Set<string>();
//   if (node.children) {
//     for (const child of node.children) {
//       childrenIds.add(child.id);
//       const childChildrenIds = getAllChildrenIds(child, allNodes);
//       childChildrenIds.forEach((id) => childrenIds.add(id));
//     }
//   }
//   return childrenIds;
// };

// const isChildOfSelectedNode = (
//   node: any,
//   selectedNodeIds: Set<string>,
//   allNodes: any[],
//   visitedNodeIds: Set<string> = new Set(),
// ): boolean => {
//   if (selectedNodeIds.has(node.id)) {
//     return true;
//   }
//   if (node.parentId && !visitedNodeIds.has(node.id)) {
//     visitedNodeIds.add(node.id);
//     const parentNode = allNodes.find((n) => n.id === node.parentId);
//     return parentNode ? isChildOfSelectedNode(parentNode, selectedNodeIds, allNodes, visitedNodeIds) : false;
//   }
//   return false;
// };

//// const updateNodePaths = (
//   node: any,
//   newPath: string,
//   newParentPath: string,
//   newParentId: string | null,
//   selectedNodeIds: Set<string>,
//   allNodes: any[],
// ): void => {
//   if (selectedNodeIds.has(node.id) || isChildOfSelectedNode(node, selectedNodeIds, allNodes)) {
//     node.parentId = newParentId;
//     node.namePath = `${newPath}/${node.name}`;
//     node.path = newParentPath;

//     if (node.children) {
//       node.children.forEach((childNode: any) => {
//         updateNodePaths(childNode, node.namePath, node.path, node.id, selectedNodeIds, allNodes);
//       });
//     }
//   }
// };
