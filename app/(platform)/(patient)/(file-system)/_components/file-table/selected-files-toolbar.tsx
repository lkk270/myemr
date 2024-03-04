import { Table } from "@tanstack/react-table";
import { cn, formatFileSize } from "@/lib/utils";
import { Pencil, Download, Trash, FolderPlus, Undo2, FileInput, FolderInput } from "lucide-react";
import {
  useTrashModal,
  useDeleteModal,
  useDownloadModal,
  useRenameModal,
  useAddFolderModal,
  useMoveModal,
} from "../file-tree/_components/hooks";
import { NodeDataType } from "@/app/types/file-types";
import axios from "axios";
import { toast } from "sonner";
import { useFolderStore } from "../hooks/use-folders";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

interface SelectedFilesToolbarProps<TData> {
  table: Table<TData>;
}

export function SelectedFilesToolbar<TData>({ table }: SelectedFilesToolbarProps<TData>) {
  //   const menuItems = useMenuItems();
  const { isLoading, setIsLoading } = useIsLoading();
  const moveModal = useMoveModal();
  const renameModal = useRenameModal();
  const addFolderModal = useAddFolderModal();
  const trashModal = useTrashModal();
  const deleteModal = useDeleteModal();
  const downloadModal = useDownloadModal();
  const foldersStore = useFolderStore();
  const currentUserPermissions = useCurrentUserPermissions();

  const selectedRows = table.getFilteredSelectedRowModel().rows as any;

  const cleanedRows: NodeDataType[] = selectedRows.map((obj: any) => ({
    id: obj.original.id,
    name: obj.original.name,
    parentId: obj.original.parentId,
    path: obj.original.path,
    namePath: obj.original.namePath,
    isFile: obj.original.isFile,
    isRoot: obj.original.isRoot,
    size: obj.original.size,
    restricted: obj.original.restricted,
  }));
  const numRowsSelected = cleanedRows.length;
  const hasFile = cleanedRows.some((obj: any) => obj.isFile === true);
  const allAreFiles = cleanedRows.every((obj: any) => obj.isFile === true);
  // const allAreFolders = cleanedRows.every((obj: any) => !obj.isFile);
  const allAreRootNodes = cleanedRows.every((obj: any) => obj.isRoot === true);
  const allAreNotRootNodes = cleanedRows.every((obj: any) => !obj.isRoot);
  const inTrash = cleanedRows.some((obj: any) => obj.namePath.startsWith("/Trash"));
  const hasUnrestrictedNode = cleanedRows.some((obj: any) => !obj.restricted);

  let totalSize = cleanedRows.reduce((acc, obj) => {
    return acc + (obj.size || 0);
  }, 0);

  if (numRowsSelected === 0) {
    return null;
  }

  const moveButton = (
    <div
      title={inTrash ? `Restore` : "Move"}
      onClick={() => {
        if (isLoading) {
          return;
        }
        moveModal.onOpen(cleanedRows);
        // table.resetRowSelection(true);
      }}
      role="button"
      className={cn(isLoading && "cursor-not-allowed", "hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2")}
    >
      {inTrash ? (
        <Undo2 className="w-4 h-4" />
      ) : cleanedRows[0].isFile ? (
        <FileInput className="w-4 h-4" />
      ) : (
        <FolderInput className="w-4 h-4" />
      )}
      {/* {numRowsSelected === 1 && cleanedRows[0].isFile ? (
        <FileInput className="w-4 h-4" />
      ) : (
        <FolderInput className="w-4 h-4" />
      )} */}
    </div>
  );

  const renameButton = (
    <div
      title="Rename"
      onClick={() => {
        if (isLoading) {
          return;
        }
        renameModal.onOpen(cleanedRows[0]);
      }}
      role="button"
      className={cn(isLoading && "cursor-not-allowed", "hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2")}
    >
      <Pencil className="w-4 h-4" />
    </div>
  );

  const exportButton = (
    <div
      title="Export"
      onClick={() => {
        if (isLoading) {
          return;
        }
        downloadModal.onOpen(cleanedRows);
      }}
      role="button"
      className={cn(isLoading && "cursor-not-allowed", "hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2")}
    >
      <Download className="w-4 h-4" />
    </div>
  );

  const trashButton = (
    <div
      title={inTrash ? "Permanently Delete" : "Trash"}
      onClick={() => {
        if (isLoading) {
          return;
        }
        inTrash ? deleteModal.onOpen(cleanedRows, false) : trashModal.onOpen(cleanedRows);
        // if (!inTrash) {
        //   table.resetRowSelection(true);
        // }
      }}
      role="button"
      className={cn(isLoading && "cursor-not-allowed", "hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2")}
    >
      <Trash className="w-4 h-4 text-red-400 hover:text-red-500" />
    </div>
  );

  const addSubfolderButton = (
    <div
      title="Add subfolder"
      onClick={() => {
        if (isLoading) {
          return;
        }
        addFolderModal.onOpen(cleanedRows[0], false);
      }}
      role="button"
      className={cn(isLoading && "cursor-not-allowed", "hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2")}
    >
      <FolderPlus className="w-4 h-4" />
    </div>
  );

  const restoreRootFolder = (
    <div
      title={`Restore root folder${numRowsSelected > 1 ? "s" : ""}`}
      onClick={async () => {
        if (isLoading) {
          return;
        }
        setIsLoading(true);
        for (const restoreNode of cleanedRows) {
          const promise = axios
            .post("/api/patient-update", {
              selectedId: restoreNode.id,
              updateType: "restoreRootFolder",
            })
            .then(({ data }) => {
              setIsLoading(false);
              foldersStore.restoreRootNode([restoreNode.id]);
              // table.resetRowSelection(true);
              // Success handling
            })
            .catch((error) => {
              setIsLoading(false);
              // Error handling
              throw error; // Rethrow to allow the toast to catch it
            });

          toast.promise(promise, {
            loading: "Restoring node",
            success: "Changes saved successfully",
            error: "Something went wrong",
            duration: 1250,
          });

          try {
            await promise; // Wait for the current promise to resolve or reject
          } catch (error) {
            setIsLoading(false);
            // Error handling if needed
          }
        }
      }}
      role="button"
      className={cn(isLoading && "cursor-not-allowed", "hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2")}
    >
      <Undo2 className="w-4 h-4" />
    </div>
  );

  return (
    <div className="px-1 flex items-center z-[999999] h-10 p-0.5 fixed bottom-10 rounded-lg shadow-lg dark:bg-[#303030] bg-[#292929] text-[#f6f6f6] text-sm">
      <div className="flex flex-row px-1 gap-x-2 border-r border-[#434343] pr-2">
        <span>{numRowsSelected} selected</span>
        {totalSize > 0 && (
          <span className="text-[#9d9d9d]">
            {formatFileSize(BigInt(totalSize))}
            {hasFile && !allAreFiles && cleanedRows.length > 1 && "+"}
          </span>
        )}
      </div>
      {/* 1 file or 1 folder selected */}

      {numRowsSelected === 1 && (
        <div className="flex flex-row">
          {!allAreRootNodes && !inTrash && currentUserPermissions.canEdit && renameButton}
          {allAreRootNodes && currentUserPermissions.isPatient
            ? restoreRootFolder
            : currentUserPermissions.canEdit && moveButton}
          {!cleanedRows[0].isFile && !inTrash && currentUserPermissions.canAdd && addSubfolderButton}
          {hasUnrestrictedNode && exportButton}
          {currentUserPermissions.isPatient && trashButton}
        </div>
      )}

      {/* more than one row selected*/}
      {numRowsSelected > 1 && (
        <div className="flex flex-row">
          {allAreRootNodes && currentUserPermissions.isPatient
            ? restoreRootFolder
            : allAreNotRootNodes && currentUserPermissions.canEdit && moveButton}
          {hasUnrestrictedNode && exportButton}
          {currentUserPermissions.isPatient && trashButton}
        </div>
      )}
    </div>
  );
}
