"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useFolderStore } from "./hooks/use-folders";
import { Folder, Trash2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { SingleLayerNodesType2 } from "@/app/types/file-types";
import { getFileIcon, formatFileSize, cn, getNodeHref } from "@/lib/utils";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { toast } from "sonner";

const RecordCard = ({ record }: { record: SingleLayerNodesType2 }) => {
  const currentUserPermissions = useCurrentUserPermissions();
  const isFile = record.isFile;
  const isTrash = record.namePath === "/Trash";
  const RecordIcon = isFile ? getFileIcon(record.type || "") : isTrash ? Trash2 : Folder;
  const iconColor = record.isRoot ? "#8d4fff" : !isTrash && !isFile ? "#4f5eff" : "";
  const pathSegments = record.namePath.split("/").filter((segment) => segment !== ""); // Split and filter out any empty segments

  const CardContent = ({ record }: { record: SingleLayerNodesType2 }) => {
    return (
      <CardHeader className="flex items-center justify-center text-center text-muted-foreground">
        {!isFile && !isTrash ? (
          <RecordIcon className="w-16 h-16" color={iconColor} fill={iconColor} />
        ) : (
          <RecordIcon className="w-16 h-16" color={iconColor} />
        )}
        <div className="p-2 flex flex-col gap-y-1 max-w-[175px] text-xs truncate">
          <p className="truncate font-bold">{record.name}</p>
          <p className="truncate">{record.isRoot ? "Root folder" : "In " + pathSegments.slice(-2, -1)}</p>
          {typeof record.size === "number" && <p className="truncate"> {formatFileSize(BigInt(record.size))}</p>}
        </div>
      </CardHeader> // Fixed the closing tag here
    );
  };

  return (
    <Card
      onClick={() => {
        if (record.restricted)
          toast.warning("You are out of storage, so this file is hidden. Please upgrade your plan to access it.", {
            duration: 3500,
          });
      }}
      key={record.name}
      className={cn(
        "shadow-md shadow-secondary border border-primary/10 hover:bg-primary/15 dark:hover:bg-secondary w-full h-[175px] transition bg-primary/10 rounded-xl",
        record.restricted && "opacity-60 cursor-not-allowed",
      )}
    >
      {record.restricted ? (
        <CardContent record={record} />
      ) : (
        <Link
          href={getNodeHref(currentUserPermissions.isPatient, isFile, record.id)}
          onDragStart={(e) => e.preventDefault()}
        >
          <CardContent record={record} />
        </Link>
      )}
    </Card>
  );
};

export const RecentRecordsGrid = ({}) => {
  const currentUserPermissions = useCurrentUserPermissions();
  const { singleLayerNodes } = useFolderStore();
  const folders = singleLayerNodes.filter((node) => !node.isFile).slice(0, 12);
  const files = singleLayerNodes.filter((node) => node.isFile).slice(0, 12);

  return (
    <div
      className={cn(
        "pr-3 pt-4 overflow-y-scroll",
        currentUserPermissions.canAdd
          ? "max-h-[calc(100vh-404px)] xs:max-h-[calc(100vh-210px)]"
          : "max-h-[calc(100vh-274px)] xs:max-h-[calc(100vh-140px)]",
      )}
    >
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
      {files.length === 0 ? (
        <div className="relative w-32 gap-y-4">
          <Image draggable={false} height={300} width={300} src="/noData.svg" alt="Empty" />
          <span className="text-md font-bold">No data found.</span>
        </div>
      ) : (
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
      )}
    </div>
  );
};
