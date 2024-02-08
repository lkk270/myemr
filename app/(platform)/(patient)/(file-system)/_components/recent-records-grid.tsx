"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFolderStore } from "./hooks/use-folders";
import { File, Folder, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { SingleLayerNodesType2 } from "@/app/types/file-types";
import { getFileIcon, formatFileSize } from "@/lib/utils";

const RecordCard = ({ record }: { record: SingleLayerNodesType2 }) => {
  const isFile = record.isFile;
  const isTrash = record.namePath === "/Trash";
  const RecordIcon = isFile ? getFileIcon(record.type || "") : isTrash ? Trash2 : Folder;
  const iconColor = record.isRoot ? "#8d4fff" : !isTrash && !isFile ? "#4f5eff" : "";
  const pathSegments = record.namePath.split("/").filter((segment) => segment !== ""); // Split and filter out any empty segments

  return (
    <Card key={record.name} className={`w-full h-[175px] transition border-0 bg-primary/10 rounded-xl`}>
      <Link href={isFile ? `/file/${record.id}` : `/files/${record.id}`} onDragStart={(e) => e.preventDefault()}>
        <CardHeader className="flex items-center justify-center text-center text-muted-foreground">
          {!isFile && !isTrash ? (
            <RecordIcon className="w-16 h-16" color={iconColor} fill={iconColor} />
          ) : (
            <RecordIcon className="w-16 h-16" color={iconColor} />
          )}
          <div className="p-2 flex flex-col gap-y-1 max-w-[175px] text-xs truncate">
            <p className="truncate font-bold">{record.name}</p>

            <p className="truncate">{record.isRoot ? "Root folder" : "In " + pathSegments.slice(-2, -1)}</p>
            {typeof record.size === "number" && <p className="truncate"> {formatFileSize(record.size)}</p>}
          </div>
        </CardHeader>
        {/* <CardFooter className="flex items-center justify-between text-xs text-muted-foreground"></CardFooter> */}
      </Link>
    </Card>
  );
};

export const RecentRecordsGrid = ({}) => {
  const { singleLayerNodes } = useFolderStore();
  const folders = singleLayerNodes.filter((node) => !node.isFile).slice(0, 12);
  const files = singleLayerNodes.filter((node) => node.isFile).slice(0, 12);

  return (
    <div className="pr-3 pt-4 max-h-[calc(100vh-340px)] xs:max-h-[calc(100vh-206px)] overflow-y-scroll">
      <div className="text-lg font-bold py-3">Recent Folders</div>
      <div
        className="grid grid-flow-row gap-2 pb-10 auto-cols-max"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}
      >
        {folders.map((item, index) => {
          if (!item.isFile) {
            return <RecordCard record={item} key={`file-${index}`} />;
          }
        })}
      </div>
      <div className="text-lg font-bold py-3">Recent Files</div>
      <div
        className="grid grid-flow-row gap-2 pb-10 auto-cols-max"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}
      >
        {files.map((item, index) => {
          if (item.isFile) {
            return <RecordCard record={item} key={`file-${index}`} />;
          }
        })}
      </div>
    </div>
  );
};
