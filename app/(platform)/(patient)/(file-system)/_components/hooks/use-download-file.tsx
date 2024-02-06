import { useCallback } from "react";
import { getPresignedUrl } from "../../actions/get-file-psu";

// Assuming getPresignedUrl is now a function that makes an API call to your server to get a presigned URL
export const useDownloadFile = () => {
  const downloadFile = useCallback(async (fileId: string) => {
    // Call your API endpoint to get the presigned URL
    const data = await getPresignedUrl(fileId, true);
    if (!data.presignedUrl) {
      console.error("Failed to get the presigned URL");
      return;
    }

    // Client-side logic to trigger the download
    const link = document.createElement("a");
    link.href = data.presignedUrl;
    link.setAttribute("download", data.fileName || "download");
    link.addEventListener(
      "click",
      (e) => {
        e.preventDefault(); // Prevent default anchor tag behavior
        e.stopImmediatePropagation(); // Stop the event from propagating
        window.location.href = link.href; // Manually navigate to trigger the download
      },
      true,
    ); // Capture phase
    document.body.appendChild(link);
    link.click(); // This should now prevent the toploader from activating
    document.body.removeChild(link);
  }, []);

  return downloadFile;
};
