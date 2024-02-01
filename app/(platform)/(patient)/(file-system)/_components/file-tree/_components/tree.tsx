import React, { useRef, useState, useEffect } from "react";
import { Tree } from "react-arborist";
import Node from "./node";
import { TbFolderPlus } from "react-icons/tb";
import { AiOutlineFileAdd } from "react-icons/ai";
import DragContext from "./drag-context";
import { File, FolderClosed, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Input } from "@/components/ui/input";
import _ from "lodash";
import { useFolderStore } from "../../hooks/use-folders";

interface FileTreeProps {
  width: number;
}

const CustomCursor = () => null;

const customDragPreview = (
  { offset, mouse, id, dragIds, isDragging }: any,
  tree: any,
  allSelectedHaveSameParent: boolean,
  setAllSelectedHaveSameParent: Function,
) => {
  const selectedIds = Array.from(tree.selectedIds);
  //bad selectedIds exists, id does not exist
  //drag one or more: both selectedIds and id exist
  // console.log(!tree.data);
  if (selectedIds.length === 0 && !id) {
    return null;
  }
  // if ((selectedIds.length === 0 && !id) || (selectedIds.length > 0 && !id)) {
  //   return null;
  // }
  if (!isDragging || !mouse || !tree) {
    setAllSelectedHaveSameParent(true);
    return null;
  }
  if (!allSelectedHaveSameParent) {
    return null;
  }

  // Set a flag in the tree instance to use later in disableDrag

  const numberOfSelectedIds = selectedIds.length;
  const baseZIndex = 1000;
  const baseStyle: React.CSSProperties = {
    position: "fixed",
    pointerEvents: "none",
    boxShadow: "3px 3px 6px rgba(0, 0, 0, 0.6)",
    backgroundColor: "rgba(79, 94, 255, 0.8)",
    color: "white",
    padding: "2px",
    paddingLeft: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "left",
    fontSize: "11px",
    fontFamily: "Arial, sans-serif",
    zIndex: baseZIndex,
    width: "125px",
    height: "35px",
  };

  const getItemData = (itemId: string) => {
    const itemData = itemId ? tree.get(itemId).data : null;
    const name = itemData && itemData.name ? itemData.name : "";
    const isFile = itemData && itemData.isFile;
    return { name, isFile };
  };

  const truncateName = (name: string) => {
    return name.length > 15 ? `${name.substring(0, 15)}...` : name;
  };

  const renderIconAndName = (isFile: boolean | null, name: string) => (
    <>
      {isFile ? <File className="w-4 h-4 pr-1" /> : <FolderClosed className="w-4 h-4 pr-1" />}
      <span>{name}</span>
    </>
  );

  const badgeStyle: React.CSSProperties = {
    backgroundColor: "red",
    borderRadius: "50%",
    color: "white",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: "-10px",
    right: "-10px",
    fontSize: "12px",
  };

  if (numberOfSelectedIds <= 1 || (selectedIds.length > 1 && !selectedIds.includes(id))) {
    const { name, isFile } = getItemData(id);
    const truncatedName = truncateName(name);
    if (!truncatedName) {
      return null;
    }

    return (
      <div style={{ ...baseStyle, left: mouse.x + "px", top: mouse.y + "px" }}>
        {renderIconAndName(isFile, truncatedName)}
      </div>
    );
  }

  const firstNodeParentId = tree.get(selectedIds[0]).parent.id;
  const allHaveSameParent =
    selectedIds.length > 1 && selectedIds.every((selectedId) => tree.get(selectedId).parent.id === firstNodeParentId);
  setAllSelectedHaveSameParent(allHaveSameParent);
  if (!allHaveSameParent) {
    tree.deselectAll();
    tree.select("c2-2");
    toast.error("Dragged nodes must have the same parent", { duration: 1750 });
    return null;
  }

  const stackedItems = selectedIds.map((selectedId, index) => {
    const { name, isFile } = getItemData(selectedId as string);
    const truncatedName = truncateName(name);
    const itemStyle = {
      ...baseStyle,
      left: mouse.x + 5 * index + "px",
      top: mouse.y + 5 * index + "px",
      zIndex: baseZIndex - index,
    };

    return (
      <div key={index} style={itemStyle}>
        {index === 0 && (
          <>
            {renderIconAndName(isFile, truncatedName)}
            <div style={badgeStyle}>{numberOfSelectedIds}</div>
          </>
        )}
      </div>
    );
  });

  return <div>{stackedItems}</div>;
};

const FileTree = ({ width }: FileTreeProps) => {
  const folderStore = useFolderStore();
  // const [treeInstance, setTreeInstance] = useState<any>(null);
  // folderStore.setFolders(data);
  // console.log(folderStore.folders);
  // const [treeData, setTreeData] = useState(data);
  const [term, setTerm] = useState<string>("");
  const [allSelectedHaveSameParent, setAllSelectedHaveSameParent] = useState(true);
  const treeRef = useRef<any>(null); // Replace 'any' with the appropriate type
  const [isLoading, setIsLoading] = useState(false);

  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);
  const [contextDisableDrop, setContextDisableDrop] = useState(false);
  const [screenHeight, setScreenHeight] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<{
    id: string | null;
    parentId: string | null;
    namePath: string | null;
    path: string | null;
    isFile: boolean | null;
  }>({
    id: null,
    parentId: null,
    namePath: null,
    path: null,
    isFile: null,
  });
  const [draggedNode, setDraggedNode] = useState<{
    id: string | null;
    parentId: string | null;
    namePath: string | null;
    path: string | null;
    isFile: boolean | null;
  }>({
    id: null,
    parentId: null,
    namePath: null,
    path: null,
    isFile: null,
  });

  useEffect(() => {
    // Set the screen height after the component mounts
    setScreenHeight(window.innerHeight);

    // Optional: Handle window resize
    const handleResize = () => {
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Now, this is just a reference to the tree component

  // // Update the ref callback
  // useEffect(() => {
  //   setTreeInstance(treeRef.current);
  // }, []);

  const clearInput = () => {
    setTerm("");
  };

  const customDragPreviewWithTree = (props: any) => {
    if (!treeRef || !treeRef.current) {
      console.warn("Tree instance not available");
      return null;
    }
    return customDragPreview(props, treeRef.current, allSelectedHaveSameParent, setAllSelectedHaveSameParent);
  };

  const disableDrag = () => {
    return !draggedNode.parentId || !allSelectedHaveSameParent;
  };
  // const customDragPreviewWithTree = (props: any) => customDragPreview(props, treeInstance);

  const disableDrop = ({ parentNode, dragNodes, index }: any) => {
    // Check if any of the dragged nodes are files and if they are being dropped into a folder
    const isDroppingFileIntoFolder = dragNodes.some(
      (dragNode: any) => dragNode.data.isFile && (!parentNode || !parentNode.data.children),
    );

    // Check if any of the dragged nodes have the same parent as the target parentNode
    // This will prevent reordering within the same folder but allow dropping into subfolders
    const isReorderingInSameFolder = dragNodes.some((dragNode: any) => dragNode.parent.id === parentNode.id);
    setContextDisableDrop(
      isDroppingFileIntoFolder || isReorderingInSameFolder || !hoveredNode.id || !allSelectedHaveSameParent,
    );
    // Disable drop if either of the conditions are met
    return (
      isDroppingFileIntoFolder ||
      isReorderingInSameFolder ||
      !hoveredNode.id ||
      !allSelectedHaveSameParent ||
      hoveredNode.namePath === "/Trash"
    );
  };

  const createFileFolder = (
    <div className="flex gap-2">
      <button
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 cursor-pointer"
        onClick={() => treeRef.current.createInternal()}
        title="New Folder..."
      >
        <TbFolderPlus />
      </button>
      <button
        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 cursor-pointer"
        onClick={() => treeRef.current.createLeaf()}
        title="New File..."
      >
        <AiOutlineFileAdd />
      </button>
    </div>
  );

  const onMove = ({ dragIds, parentId, index }: any) => {
    console.log(parentId);
    setIsLoading(true);
    const originalFolders = _.cloneDeep(folderStore.folders);
    folderStore.moveNodes(dragIds, parentId);
    setContextDisableDrop(true);
    const promise = axios
      .post("/api/patient-update", {
        selectedIds: dragIds,
        targetId: parentId,
        updateType: "moveNode",
      })
      .then(({ data }) => {
        setIsLoading(false);
      })
      .catch((error) => {
        folderStore.setFolders(originalFolders);
        console.log(error?.response?.data);
        // error = error?.response?.data || "Something went wrong";
        // console.log(error);
        throw error;
      })
      .finally(() => {
        setIsLoading(false);
        // renameModal.onClose();
        //no need for set loading to false
        // Toggle edit mode off after operation
      });
    toast.promise(promise, {
      loading: dragIds.length > 1 ? "Moving nodes" : "Moving node",
      success: "Changes saved successfully",
      error: "Something went wrong",
      duration: 1250,
    });
  };
  if (!folderStore.foldersSet) {
    return null;
  }

  return (
    <>
      <div className="p-4">
        {/* <Item label="Search" icon={Search} isSearch onClick={search.onOpen} /> */}
        {/* <Item onClick={handleCreate} label="New page" icon={PlusCircle} /> */}
        <Input
          className="pr-8 bg-secondary border-primary/10 text-muted-foreground font-medium"
          placeholder="Filter"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        {term && (
          <div role="button" onClick={clearInput}>
            <X className="h-6 w-6 text-muted-foreground rounded-sm absolute top-16 right-6" />
          </div>
        )}
      </div>
      <div
        className="overflow-y-hidden"
        //style={{ height: `calc(100vh)` }}
      >
        <DragContext.Provider
          value={{
            hoveredNode,
            setHoveredNode,
            draggedNode,
            setDraggedNode,
            hoveredFolderId,
            setHoveredFolderId,
            contextDisableDrop,
            setContextDisableDrop,
          }}
        >
          <div className="tree-container overflow-x-hidden overflow-y-hidden">
            {/* <div className="flex items-center">
              {createFileFolder}
              <input
                type="text"
                placeholder="Search..."
                className="w-10 border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </div> */}
            {/* <FillFlexParent realWidth={width - 24} height={500}>
          {(dimens) => ( */}
            <Tree
              // {...dimens}
              //h-[calc(100vh-100px)]
              className="custom-scrollbar overflow-y-hidden pb-4"
              renderCursor={CustomCursor}
              renderDragPreview={customDragPreviewWithTree}
              ref={treeRef}
              disableMultiSelection={false}
              openByDefault={false}
              data={folderStore.folders}
              // initialData={folderStore.folders}
              width={width - 8}
              height={screenHeight - 230}
              // rowClassName={"max-w-[200px] w-full"}
              indent={15}
              rowHeight={31}
              searchTerm={term}
              disableDrop={disableDrop}
              disableDrag={disableDrag}
              onMove={onMove}
              searchMatch={(node, term) => node.data.namePath.toLowerCase().includes(term.toLowerCase())}
            >
              {Node as any}
            </Tree>
            {/* )}
       </FillFlexParent> */}
          </div>
        </DragContext.Provider>
      </div>
    </>
  );
};

export default FileTree;
