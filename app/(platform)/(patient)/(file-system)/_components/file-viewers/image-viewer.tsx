import {
  DownloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { Image, Space } from "antd";
import FileSaver from "file-saver";
import { getPresignedUrl } from "../../actions/get-file-psu";

interface ImageViewerProps {
  fileId: string;
  fileSrc: string;
}
export const ImageViewer = ({ fileId, fileSrc }: ImageViewerProps) => {
  const [fileSrcTrue, setFileSrcTrue] = useState(fileSrc);
  const calculateImageWidth = () =>
    window.innerWidth <= 768 ? Math.min(window.innerWidth - 100, 510) : Math.min(window.innerWidth - 450, 510);

  const [imageWidth, setImageWidth] = useState(calculateImageWidth);

  useEffect(() => {
    const handleResize = () => {
      setImageWidth(calculateImageWidth());
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handleResize immediately in case the initial window size is not the default
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDownload = async () => {
    try {
      const response = await fetch(fileSrc);
      if (!response.ok) throw new Error("Network response was not ok.");
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "filename.extension"); // Choose a filename and extension
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl); // Clean up
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleDownload2 = async () => {
    try {
      FileSaver.saveAs(fileSrc, "2.JPG");
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleDownload3 = async () => {
    const data = await getPresignedUrl(fileId, true);
    if (!data.presignedUrl) {
      return;
    }

    FileSaver.saveAs(data.presignedUrl, data.fileName);
  };

  const handleDownload4 = async () => {
    const data = await getPresignedUrl(fileId, true); // Assuming this returns the presigned URL
    if (!data.presignedUrl) {
      return;
    }

    // Create an invisible `<a>` element
    const link = document.createElement("a");
    link.href = data.presignedUrl;
    link.style.display = "none";
    link.setAttribute("download", data.fileName); // Set the desired filename here

    // Append to the document and trigger the download
    document.body.appendChild(link);
    link.addEventListener("click", (e) => {
      console.log("IN HERE");
    });

    // Clean up by removing the element after download
    document.body.removeChild(link);
  };

  const handleDownload5 = async () => {
    const data = await getPresignedUrl(fileId, true); // Your function to get the presigned URL
    if (!data.presignedUrl) {
      console.error("Failed to get the presigned URL");
      return;
    }

    // Create an anchor tag for the download
    const link = document.createElement("a");
    link.href = data.presignedUrl;
    link.setAttribute("download", data.fileName); // Set the desired filename here

    // Prevent the toploader from triggering
    link.addEventListener(
      "click",
      (e) => {
        e.preventDefault(); // Prevent default anchor tag behavior
        e.stopImmediatePropagation(); // Stop the event from propagating
        window.location.href = link.href; // Manually navigate to trigger the download
      },
      true,
    ); // Capture phase

    // Append to the document, trigger click, and remove
    document.body.appendChild(link);
    link.click(); // This should now prevent the toploader from activating
    document.body.removeChild(link);
  };

  return (
    <Image
      className="overflow-hidden"
      width={imageWidth}
      //   height={500}
      src={fileSrc}
      preview={{
        forceRender: true,
        toolbarRender: (
          _,
          { transform: { scale }, actions: { onFlipY, onFlipX, onRotateLeft, onRotateRight, onZoomOut, onZoomIn } },
        ) => (
          <Space size={12} className="toolbar-wrapper">
            <DownloadOutlined onClick={handleDownload5} />
            <SwapOutlined rotate={90} onClick={onFlipY} />
            <SwapOutlined onClick={onFlipX} />
            <RotateLeftOutlined onClick={onRotateLeft} />
            <RotateRightOutlined onClick={onRotateRight} />
            <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
            <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
          </Space>
        ),
      }}
    />
  );
};
