"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FileIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Item } from "./item";

import { Folder } from "@prisma/client";

interface FolderTreeProps {
  folder: any;
  level: number;
}

export const FolderTree: React.FC<FolderTreeProps> = ({ folder, level }) => {
  const [expanded, setExpanded] = useState(false);
  const handleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div>
      <Item
        id={folder.id}
        label={folder.title}
        icon={FileIcon}
        expanded={expanded}
        onExpand={handleExpand}
        level={folder.level}
      />
      {expanded && (
        <div>
          {folder.files.map((file: any) => (
            <Item key={file.id} label={file.title} icon={FileIcon} level={file.level} />
          ))}
          {folder.children.map((childFolder: any) => (
            <FolderTree key={childFolder.id} folder={childFolder} level={childFolder.level} />
          ))}
        </div>
      )}
    </div>
  );
};
