"use client";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useTransition } from "react";
import { getFilesByToken } from "../../data/temp-upload-get-files";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";
import { useSession } from "next-auth/react";
import { FileStatus } from "@prisma/client";
import { formatFileSize } from "@/lib/utils";
import { accessCodeType } from "@/app/types";

interface ViewUploadHistoryButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
  token?: string;
}

export const ViewUploadHistoryButton = ({ children, asChild, token }: ViewUploadHistoryButtonProps) => {
  let tempToken = token;
  let type = "requestRecordsCode";
  if (!token) {
    type = "patientProfileAccessCode";
    const session = useSession();
    const sessionData = session.data;
    tempToken = sessionData?.tempToken;
  }

  const [files, setFiles] = useState<{ id: string; name: string; size: number; status: FileStatus }[] | null>([]);
  const [isPending, startTransition] = useTransition();
  const openDialog = () => {
    if (!tempToken) return;
    startTransition(() => {
      getFilesByToken(tempToken!, type as accessCodeType)
        .then((data) => {
          setFiles(data);
        })
        .catch((error) => {
          console.log(error);
          toast.error("something went wrong");
        });
    });
  };
  return (
    <Dialog>
      <DialogTrigger onClick={openDialog} asChild={asChild}>
        {children}
      </DialogTrigger>
      <DialogContent className="overflow-y-scroll max-h-[calc(100vh-200px)] max-w-[850px] w-full">
        <DialogTitle className="text-md">
          Your upload history
          <span className="font-normal ml-2">
            {files && files.length > 0 && `(Total: ${files.length} ${files.length === 1 ? "file" : "files"})`}
          </span>
        </DialogTitle>

        {isPending ? (
          <div className="flex flex-col items-center justify-center">
            <BeatLoader color="#4b59f0" />
          </div>
        ) : !files || files.length === 0 ? (
          <div>🫀No file history. You have not uploaded any files for this access session🫀</div>
        ) : (
          <ul className="list-decimal overflow-hidden max-w-full text-sm">
            {files.map((file, index) => (
              <li key={index} className={`flex ${file.status === "SUCCESS" ? "text-green-600" : "text-red-500"}`}>
                <div className="flex-1 min-w-0">
                  <p className="truncate">
                    {index + 1}.{"  "}
                    {file.name}
                  </p>
                </div>
                <span className="flex-shrink-0 pl-2 whitespace-nowrap">{formatFileSize(file.size)}</span>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
};
