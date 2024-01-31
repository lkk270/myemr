import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Table } from "@tanstack/react-table";
import { formatFileSize } from "@/lib/utils";
import { useMenuItems } from "@/app/(platform)/(patient)/(file-system)/_components/file-tree/_components/hooks";
import { Pencil, Upload, FileInput, FolderInput, Download, Trash, FolderPlus } from "lucide-react";
import {
  useDeleteModal,
  useDownloadModal,
  useRenameModal,
  useAddFolderModal,
  useMoveModal,
} from "../file-tree/_components/hooks";
import { NodeDataType } from "@/app/types/file-types";

interface SelectedFilesToolbarProps<TData> {
  table: Table<TData>;
}

export function SelectedFilesToolbar<TData>({ table }: SelectedFilesToolbarProps<TData>) {
  //   const menuItems = useMenuItems();
  const moveModal = useMoveModal();
  const renameModal = useRenameModal();
  const addFolderModal = useAddFolderModal();
  const deleteModal = useDeleteModal();

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
  }));
  const numRowsSelected = cleanedRows.length;
  const hasFile = cleanedRows.some((obj: any) => obj.isFile === true);
  const allAreFiles = cleanedRows.every((obj: any) => obj.isFile === true);
  const allAreFolders = cleanedRows.every((obj: any) => !obj.isFile);

  let totalSize = cleanedRows.reduce((acc, obj) => {
    return acc + (obj.size || 0);
  }, 0);

  if (numRowsSelected === 0) {
    return null;
  }
  return (
    <div className="px-1 flex items-center z-[999999] h-10 p-0.5 fixed bottom-10 rounded-lg shadow-lg dark:bg-[#303030] bg-[#292929] text-[#f6f6f6] text-sm">
      <div className="flex flex-row px-1 gap-x-2 border-r border-[#434343] pr-2">
        <span>{numRowsSelected} selected</span>
        {totalSize > 0 && <span className="text-[#9d9d9d]">{formatFileSize(totalSize)}</span>}
      </div>
      {/* 1 file selected */}
      {numRowsSelected === 1 && cleanedRows[0].isFile && (
        <div className="flex flex-row">
          <div
            title="move"
            onClick={() => moveModal.onOpen(cleanedRows)}
            role="button"
            className="hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2"
          >
            <FileInput className="w-4 h-4" />
          </div>
          <div
            onClick={() => renameModal.onOpen(cleanedRows[0])}
            role="button"
            className="hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2"
          >
            <Pencil className="w-4 h-4" />
          </div>
          <div
            onClick={() => deleteModal.onOpen(cleanedRows)}
            role="button"
            className="hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2"
          >
            <Trash className="w-4 h-4 text-red-400 focus:text-red-500" />
          </div>
        </div>
      )}
      {/* 1 folder selected */}
      {numRowsSelected === 1 && !cleanedRows[0].isFile && (
        <div className="flex flex-row">
          <div
            title="move"
            onClick={() => moveModal.onOpen(cleanedRows)}
            role="button"
            className="hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2"
          >
            <FolderInput className="w-4 h-4" />
          </div>
          <div
            onClick={() => renameModal.onOpen(cleanedRows[0])}
            role="button"
            className="hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2"
          >
            <Pencil className="w-4 h-4" />
          </div>
          <div
            onClick={() => addFolderModal.onOpen(cleanedRows[0], false)}
            role="button"
            className="hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2"
          >
            <FolderPlus className="w-4 h-4" />
          </div>
          <div
            onClick={() => deleteModal.onOpen(cleanedRows)}
            role="button"
            className="hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2"
          >
            <Trash className="w-4 h-4 text-red-400 hover:text-red-500" />
          </div>
        </div>
      )}
      {/* Only files selected */}
      {numRowsSelected > 1 && allAreFiles && (
        <div className="flex flex-row">
          <div
            title="move"
            onClick={() => moveModal.onOpen(cleanedRows)}
            role="button"
            className="hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2"
          >
            <FileInput className="w-4 h-4" />
          </div>
          <div
            onClick={() => deleteModal.onOpen(cleanedRows)}
            role="button"
            className="hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2"
          >
            <Trash className="w-4 h-4 text-red-400 hover:text-red-500" />
          </div>
        </div>
      )}
      {/* Only folders selected */}
      {numRowsSelected > 1 && allAreFolders && (
        <div className="flex flex-row">
          <div
            title="move"
            onClick={() => moveModal.onOpen(cleanedRows)}
            role="button"
            className="hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2"
          >
            <FolderInput className="w-4 h-4" />
          </div>
          <div
            onClick={() => deleteModal.onOpen(cleanedRows)}
            role="button"
            className="hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2"
          >
            <Trash className="w-4 h-4 text-red-400 hover:text-red-500" />
          </div>
        </div>
      )}
      {/* A combination of files & folders selected */}
      {numRowsSelected > 1 && hasFile && !allAreFiles && (
        <div className="flex flex-row">
          <div
            title="move"
            onClick={() => moveModal.onOpen(cleanedRows)}
            role="button"
            className="hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2"
          >
            <FolderInput className="w-4 h-4" />
          </div>
          <div
            onClick={() => deleteModal.onOpen(cleanedRows)}
            role="button"
            className="hover:bg-[#363636] dark:hover:bg-[#3c3c3c] rounded-sm p-2"
          >
            <Trash className="w-4 h-4 text-red-400 hover:text-red-500" />
          </div>
        </div>
      )}
    </div>
  );
}
