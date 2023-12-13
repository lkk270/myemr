"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FileIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Item } from "./item";

import { Folder } from "@prisma/client";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

interface FolderTreeProps {
  folder: any;
  level?: number;
}

export const FolderTree: React.FC<FolderTreeProps> = ({ folder, level = 0 }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Droppable droppableId={`folder-${folder.id}`}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          <Draggable key={folder.id} draggableId={`folder-${folder.id}`} index={0}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                <Item
                  id={folder.id}
                  label={folder.title}
                  icon={FileIcon}
                  expanded={expanded}
                  onExpand={handleExpand}
                  level={folder.level}
                />
              </div>
            )}
          </Draggable>

          {expanded && (
            <>
              {folder.children.map((childFolder: any, index: number) => (
                <Draggable key={childFolder.id} draggableId={`folder-${childFolder.id}`} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <FolderTree key={childFolder.id} folder={childFolder} level={childFolder.level} />
                    </div>
                  )}
                </Draggable>
              ))}

              {folder.files.map((file: any, index: number) => (
                <Draggable key={file.id} draggableId={`file-${file.id}`} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      {/* Render file item here, similar to FolderTree item */}
                      <Item
                        isFile={true}
                        id={file.id}
                        key={file.id}
                        label={file.title}
                        icon={FileIcon}
                        level={file.level}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
            </>
          )}

          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};
