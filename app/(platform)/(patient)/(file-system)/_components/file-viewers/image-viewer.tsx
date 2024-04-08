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
// import { getPresignedUrl, handleDownload } from "../../actions/get-file-psu";
import { useDownloadFile } from "../hooks/use-download-file";
import { usePathname } from "next/navigation";
import { usePatientMemberStore } from "@/app/(platform)/(provider)/(organization)/(routes)/(patient)/hooks/use-patient-member-store";
interface ImageViewerProps {
  fileId: string;
  fileSrc: string;
  forInsurance?: boolean;
}
const ImageViewerComponent = ({ fileId, fileSrc, forInsurance = false }: ImageViewerProps) => {
  const downloadFile = useDownloadFile();
  const { patientMember } = usePatientMemberStore();

  const pathname = usePathname();
  let patientMemberIdOrUserId = pathname.includes("patient/") ? pathname.split("/patient/")[1].split("/")[0] : null;
  if (forInsurance && !!patientMemberIdOrUserId) {
    patientMemberIdOrUserId = patientMember?.patientProfileId || null;
  }
  const calculateImageWidth = () => {
    if (forInsurance) {
      return Math.min(350, window.innerWidth);
    } else {
      return window.innerWidth <= 768 ? Math.min(window.innerWidth - 100, 510) : Math.min(window.innerWidth - 450, 510);
    }
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileSrc]);

  //   const handleDownload = async () => {
  //     const data = await getPresignedUrl(fileId, true); // Your function to get the presigned URL
  //     if (!data.presignedUrl) {
  //       console.error("Failed to get the presigned URL");
  //       return;
  //     }

  //     // Create an anchor tag for the download
  //     const link = document.createElement("a");
  //     link.href = data.presignedUrl;
  //     link.setAttribute("download", data.fileName); // Set the desired filename here

  //     // Prevent the toploader from triggering
  //     link.addEventListener(
  //       "click",
  //       (e) => {
  //         e.preventDefault(); // Prevent default anchor tag behavior
  //         e.stopImmediatePropagation(); // Stop the event from propagating
  //         window.location.href = link.href; // Manually navigate to trigger the download
  //       },
  //       true,
  //     ); // Capture phase

  //     // Append to the document, trigger click, and remove
  //     document.body.appendChild(link);
  //     link.click(); // This should now prevent the toploader from activating
  //     document.body.removeChild(link);
  //   };

  return (
    <Image
      alt={fileId}
      className="overflow-hidden"
      width={imageWidth}
      //   height={500}
      src={fileSrc}
      rootClassName="justify-center items-center flex flex-col"
      preview={{
        forceRender: true,
        toolbarRender: (
          _,
          { transform: { scale }, actions: { onFlipY, onFlipX, onRotateLeft, onRotateRight, onZoomOut, onZoomIn } },
        ) => (
          <Space size={12} className="toolbar-wrapper">
            <DownloadOutlined onClick={() => downloadFile(fileId, forInsurance, patientMemberIdOrUserId)} />
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

export const ImageViewer = React.memo(ImageViewerComponent);
