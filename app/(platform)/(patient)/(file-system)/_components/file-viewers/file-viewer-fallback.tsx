import { DownloadButton } from "../download-button";

interface FileViewerFallbackProps {
  fileId: string;
}

export const FileViewerFallback = ({ fileId }: FileViewerFallbackProps) => {
  return (
    <div className="p-4 max-w-lg mx-auto rounded-lg shadow-md dark:bg-[#303030] bg-[#f6f6f6] text-[#303030] dark:text-[#f6f6f6]">
      <h2 className="text-lg font-semibold mb-4">
        We are unable to display this file type at this time, but are actively working to support more file types in the
        near future. We apologize for any inconvenience.
      </h2>
      <DownloadButton fileId={fileId} />
    </div>
  );
};
