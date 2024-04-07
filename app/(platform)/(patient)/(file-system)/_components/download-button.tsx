import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useDownloadFile } from "./hooks/use-download-file";
import { usePathname } from "next/navigation";
interface DownloadButtonProps {
  fileId: string;
}

export const DownloadButton = ({ fileId }: DownloadButtonProps) => {
  const { isLoading } = useIsLoading();
  const downloadFile = useDownloadFile();
  const pathname = usePathname();
  const patientMemberId = pathname.includes("patient/") ? pathname.split("/patient/")[1].split("/")[0] : null;
  
  return (
    <Button
      title="Export"
      onClick={() => {
        if (isLoading) {
          return;
        }
        downloadFile(fileId, false, patientMemberId);
      }}
    >
      <Download className="w-4 h-4 mr-1" /> Download
    </Button>
  );
};
