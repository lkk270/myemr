import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useDownloadFile } from "./hooks/use-download-file";

interface DownloadButtonProps {
  fileId: string;
}

export const DownloadButton = ({ fileId }: DownloadButtonProps) => {
  const { isLoading } = useIsLoading();
  const downloadFile = useDownloadFile();

  return (
    <Button
      title="Export"
      onClick={() => {
        if (isLoading) {
          return;
        }
        downloadFile(fileId);
      }}
    >
      <Download className="w-4 h-4 mr-1" /> Download
    </Button>
  );
};
