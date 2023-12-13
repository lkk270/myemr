"use client";

import React from "react";
import { FolderTree } from "./folder-tree"; // Adjust the import path as needed
import { Folder } from "@prisma/client"; // Or your custom interface
import { DragDropContext } from "@hello-pangea/dnd";

interface FoldersTreeProps {
  folders: any[]; // Assuming Folder includes 'children' and 'files'
}

export const FoldersTree: React.FC<FoldersTreeProps> = ({ folders }) => {
  return (
    <div>
      {folders.map((folder) => (
        <FolderTree key={folder.id} level={folder.level} folder={folder} />
      ))}
    </div>
  );
};
