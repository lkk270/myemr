"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
import { useDownloadModal } from "../hooks/use-download-modal";
import { useDownloadFile, useDownloadZip } from "../../../hooks/use-download-file";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useFolderStore } from "../../../hooks/use-folders";

export const DownloadModal = () => {
  const [isMounted, setIsMounted] = useState(false);
  const downloadModal = useDownloadModal();
  const downloadFile = useDownloadFile();
  const downloadZip = useDownloadZip();
  const { singleLayerNodes } = useFolderStore();
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [parentNamePath, setParentNamePath] = useState<string>("");
  const [parentName, setParentName] = useState<string>("");

  const downloadNodes = downloadModal.nodeDatas;
  const firstDownloadNode = downloadNodes ? downloadNodes[0] : null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !downloadNodes || downloadNodes.length === 0) {
      return;
    }

    let newFileIds: string[] = [];
    let newParentNamePath = "";
    let newParentName = "";
    if (!!firstDownloadNode && !firstDownloadNode.isFile && downloadNodes.length === 1) {
      newFileIds = singleLayerNodes
        .filter((node) => node.isFile && node.path.includes(`/${firstDownloadNode.id}/`))
        .map((node) => node.id);
      newParentNamePath = firstDownloadNode.namePath;
      newParentName = firstDownloadNode.name;
    } else if (downloadNodes.length > 1) {
      downloadNodes.forEach((node) => {
        if (node.isFile) {
          newFileIds.push(node.id);
        } else {
          let folderFileIds = singleLayerNodes
            .filter((n) => n.isFile && n.path.includes(`/${node.id}/`))
            .map((n) => n.id);
          newFileIds = [...newFileIds, ...folderFileIds];
        }
      });
      const parentNode = singleLayerNodes.find((node) => node.id === firstDownloadNode?.parentId);
      newParentNamePath = parentNode?.namePath || "enclosing";
      newParentName = parentNode?.name || "enclosing";
    }
    setParentNamePath(newParentNamePath);
    setParentName(newParentName);
    setFileIds(newFileIds);
  }, [isMounted, downloadNodes, singleLayerNodes]);

  if (!isMounted || !downloadModal.isOpen || !downloadNodes || !firstDownloadNode) {
    return null;
  }

  return (
    <AlertDialog open={downloadModal.isOpen} onOpenChange={downloadModal.onClose}>
      <AlertDialogContent className="flex flex-col xs:max-w-[360px]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Export{" "}
            <span className={cn("whitespace-normal break-all", downloadNodes.length === 1 && "italic")}>
              {downloadNodes.length === 1 ? firstDownloadNode.name : "selected items"}
            </span>{" "}
            ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {firstDownloadNode.isFile && downloadNodes.length === 1
              ? "This will download the file to your device."
              : "This will download a zip file to your device."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="w-20 h-8 text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="w-20 h-8 text-sm"
            onClick={async () => {
              downloadNodes[0].isFile && downloadNodes.length === 1
                ? downloadFile(firstDownloadNode.id)
                : downloadZip(fileIds, parentNamePath, parentName);
              downloadModal.onClose();
            }}
          >
            Export
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
