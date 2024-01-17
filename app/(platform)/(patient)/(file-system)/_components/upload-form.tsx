"use client";
import { Dropzone } from "@/components/files/dropzone";
import { useState } from "react";

export const UploadForm = () => {
  const [files, setFiles] = useState<string[]>([]);

  return (
    <div className="pt-24">
      hello
      {/* <Dropzone onChange={setFiles} className="w-full" fileExtension="pdf" /> */}
    </div>
  );
};
