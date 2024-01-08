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

import { useState, useEffect } from "react";

export const DownloadModal = () => {
  const [isMounted, setIsMounted] = useState(false);
  const downloadModal = useDownloadModal();
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !downloadModal || !downloadModal.nodeData) {
    return null;
  }
  return (
    <AlertDialog open={downloadModal.isOpen} onOpenChange={downloadModal.onClose}>
      <AlertDialogContent className="flex flex-col xs:max-w-[360px]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Export <span className="italic">{downloadModal.nodeData.name}</span>?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {downloadModal.nodeData.isFile
              ? "This will download the file to your device."
              : "This will download a zip file to your device."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="w-20 h-8 text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction className="w-20 h-8 text-sm">Export</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
