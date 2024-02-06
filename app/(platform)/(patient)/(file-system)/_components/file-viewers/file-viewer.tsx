"use client";

import { useEffect, useState, useRef } from "react";
import { useIsLoading } from "@/hooks/use-is-loading";
// import Viewer from "react-viewer";
import Image from "next/image";
import { ImageViewer } from "./image-viewer";
import { Spinner } from "@/components/spinner";
// import FileViewer from "react-file-viewer";
// import WebViewer from "@pdftron/webviewer";
interface FileViewerProps {
  fileId: string;
  fileSrc: string;
  fileType: string;
}

export const Viewer = ({ fileId, fileSrc, fileType }: FileViewerProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading } = useIsLoading();
  const [visible, setVisible] = useState(true);
  console.log(fileType);
  //   const viewer = useRef<any>(null);

  // if using a class, equivalent of componentDidMount
  //   useEffect(() => {
  //     WebViewer(
  //       {
  //         path: "/webviewer/lib",
  //         initialDoc: fileSrc,
  //         licenseKey: "your_license_key", // sign up to get a free trial key at https://dev.apryse.com
  //       },
  //       viewer.current,
  //     ).then((instance) => {
  //       const { documentViewer, annotationManager, Annotations } = instance.Core;

  //       documentViewer.addEventListener("documentLoaded", () => {
  //         const rectangleAnnot = new Annotations.RectangleAnnotation({
  //           PageNumber: 1,
  //           // values are in page coordinates with (0, 0) in the top left
  //           X: 100,
  //           Y: 150,
  //           Width: 200,
  //           Height: 50,
  //           Author: annotationManager.getCurrentUser(),
  //         });

  //         annotationManager.addAnnotation(rectangleAnnot);
  //         // need to draw the annotation otherwise it won't show up until the page is refreshed
  //         annotationManager.redrawAnnotation(rectangleAnnot);
  //       });
  //     });
  //   }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    // <div className="pb-4 gap-y-2 flex flex-col  max-h-[calc(100vh-135px)] overflow-y-scroll min-w-[800px] dark:bg-[#1f1f1f] text-black">
    //   {/* <Viewer
    //     visible={visible}
    //     onClose={() => {
    //       setVisible(false);
    //     }}
    //     images={[{ src: fileSrc }]}
    //   /> */}
    //   {/* <Image src={fileSrc} alt={""} height={500} width={500} /> */}
    //   {/* <div className="webviewer" ref={viewer}></div> */}
    //   {/* <FileViewer fileType={"jpeg"} filePath={fileSrc} /> */}
    //   {fileType.includes("image") ? (
    //     <Image src={fileSrc} layout="fill" objectFit="contain" alt="" />
    //   ) : (
    //     <iframe src={fileSrc} className="w-full h-full max-w-xs max-h-xs overflow-hidden" />
    //   )}
    // </div>
    <div className="relative pb-4 gap-y-2 flex flex-col max-h-[calc(100vh-160px)] dark:bg-[#1f1f1f] text-black overflow-hidden">
      {fileType.includes("image") ? (
        <div className="justify-between items-center flex flex-col max-w-[cal(100vw-300px)]">
          <ImageViewer fileId={fileId} fileSrc={fileSrc} />
        </div>
      ) : (
        <div className="max-w-[cal(100vw-300px)] flex flex-col w-full h-[calc(100vh-160px)]">
          <iframe src={fileSrc} className="flex-grow overflow-hidden" />
        </div>
      )}
    </div>
  );
};
