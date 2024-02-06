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
  const downloadNodes = downloadModal.nodeDatas;
  const firstDownloadNode = downloadNodes ? downloadNodes[0] : null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !downloadModal || !downloadNodes || !firstDownloadNode) {
    return null;
  }
  let fileIds: string[] = [];
  if (!firstDownloadNode.isFile) {
    fileIds = singleLayerNodes
      .filter((node) => node.isFile && node.path.includes(`/${firstDownloadNode.id}/`))
      .map((node) => node.id);
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
              downloadNodes[0].isFile
                ? downloadFile(firstDownloadNode.id)
                : downloadZip(fileIds, firstDownloadNode.namePath, firstDownloadNode.name);
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
