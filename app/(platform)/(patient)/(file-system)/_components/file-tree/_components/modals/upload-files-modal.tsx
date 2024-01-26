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
import { useUploadFilesModal } from "../hooks/use-upload-files-modal";
import { useFolderStore } from "../../../hooks/use-folders";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { isValidNodeName } from "@/lib/utils";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { message, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import _ from "lodash";
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

export const UploadFilesModal = () => {
  const user = useCurrentUser();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const uploadFilesModal = useUploadFilesModal();
  const folderStore = useFolderStore();

  const { Dragger } = Upload;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !uploadFilesModal || !uploadFilesModal.nodeData) {
    return null;
  }

  const handleSave = () => {
    setIsLoading(true);
    const nodeData = uploadFilesModal.nodeData;
    const folderName = "";
    const userId = user?.id;
    const email = user?.email;
    const parentId = nodeData.id;
    if (!email || !userId) {
      toast.error("Something went wrong");
      return;
    }
    if (!isValidNodeName(folderName)) {
      toast.error("New name is invalid");
      setIsLoading(false);
      //   uploadFilesModal.onClose();
      return;
    }
    const promise = axios
      .post("/api/patient-update", {
        parentId: parentId,
        folderName: folderName,
        addedByUserId: userId,
        patientUserId: userId,
        addedByName: email,
        updateType: "",
      })
      .then(({ data }) => {
        console.log(data);
        const folder = data.folder;
        console.log(folder);
        folderStore.addSubFolder(folder.id, folder.name, folder.parentId, folder.path, folder.namePath, userId, email);
        setIsLoading(false);
        uploadFilesModal.onClose();
      })
      .catch((error) => {
        error = error?.response?.data;
        if (error && error !== "Internal Error") {
          toast.error(error);
        }
        throw error;
      })
      .finally(() => {
        setIsLoading(false);
        // uploadFilesModal.onClose();
        //no need for set loading to false
        // Toggle edit mode off after operation
      });
    toast.promise(promise, {
      loading: "Saving changes",
      success: "Changes saved successfully",
      error: "Something went wrong",
      duration: 1250,
    });
  };

  const createBeforeUploadHandler = () => {
    let toastShown = false;
    const disallowedTypes = new Set(["application/zip", "application/x-diskcopy", "application/x-msdownload"]); // Add other disallowed types here

    return (a: any, beforeFileList: any[]) => {
      console.log(beforeFileList);
      const startingFilesLength = fileList.length;
      const validFileList = beforeFileList.filter((file) => !disallowedTypes.has(file.type));

      if (validFileList.length !== beforeFileList.length && !toastShown) {
        toast.error("Disallowed file types (e.g., zip, dmg, exe) have been excluded.", {
          duration: 3000,
        });
        toastShown = true; // Prevent multiple toast messages for disallowed types
      }

      const totalFilesCount = startingFilesLength + validFileList.length;

      if (startingFilesLength === 10 && !toastShown) {
        toast.error("You have already selected 10 files - only 10 files can be uploaded at a time!", {
          duration: 3000,
        });
        toastShown = true;
      }

      if (totalFilesCount > 10) {
        if (!toastShown) {
          const filesToAdd = validFileList.slice(0, 10 - startingFilesLength);

          if (startingFilesLength === 0) {
            toast.error(`Can only upload 10 files at a time. Only taking the first 10 selected files`, {
              duration: 3000,
            });
          } else {
            const availableSlots = 10 - startingFilesLength;
            toast.error(
              `Can only upload 10 files at a time. Only taking the first ${availableSlots} additional files.`,
              { duration: 3000 },
            );
          }
          toastShown = true;
          setFileList([...fileList, ...filesToAdd]);
          return false;
        }
      }

      setFileList([...fileList, ...validFileList]);
      return false;
    };
  };

  const props: UploadProps = {
    multiple: true,
    maxCount: 4,
    onRemove: (file: any) => {
      console.log(fileList);
      console.log(file.status);
      const disallowedStatuses = {
        removed: "has already been removed",
        done: "has already been uploaded",
        uploading: "is being uploaded",
      };
      const fileStatus = file.status as string | undefined;

      if (fileStatus && Object.keys(disallowedStatuses).includes(fileStatus)) {
        toast.error(`Can't remove a file that ${disallowedStatuses[fileStatus as keyof typeof disallowedStatuses]}!`);
        return false;
      }

      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },

    beforeUpload: createBeforeUploadHandler(),

    fileList,
  };

  const handleUpload = async () => {
    setIsLoading(true);
    const formData = new FormData();
    if (fileList.length === 0) {
      toast.error("No files were selected");
      return;
    }

    const tempFileList = [...fileList] as any[]; // clone the fileList
    for (let index = 0; index < tempFileList.length; index++) {
      const file = tempFileList[index];
      formData.append("files[]", file as FileType);
      tempFileList[index].status = "uploading";
      setFileList([...tempFileList]); // update the fileList for each file

      const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      if (response.ok) {
        const { url, fields } = await response.json();
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
        formData.append("file", file as any);

        const uploadResponse = await fetch(url, {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          tempFileList[index].status = "success";
        } else {
          tempFileList[index].status = "error";
        }
      } else {
        tempFileList[index].status = "error";
      }
      setFileList([...tempFileList]); // update the fileList after each upload
    }
    setIsLoading(false);
  };

  return (
    <AlertDialog open={uploadFilesModal.isOpen}>
      <AlertDialogContent className="flex flex-col xs:max-w-[400px] max-h-[100vh] overflow-y-scroll">
        <AlertDialogHeader>
          <AlertDialogTitle className="whitespace-normal break-all">
            Upload files to <span className="italic">{uploadFilesModal.nodeData.name}</span>?
          </AlertDialogTitle>
          <div className="text-primary pt-2 overflow-y-scroll">
            <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="text-sm text-primary">
                Click or drag file(s) to this area to upload. 10 files can be uploaded at a time.
              </p>
            </Dragger>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={uploadFilesModal.onClose} className="w-20 h-8 text-sm">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading || fileList.length === 0}
            onClick={() => {
              handleUpload();
            }}
            className="w-20 h-8 text-sm"
          >
            Upload
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// "use client";

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { useUploadFilesModal } from "../hooks/use-upload-files-modal";
// import { useFolderStore } from "../../../hooks/use-folders";
// import { useState, useEffect } from "react";
// import { toast } from "sonner";
// import axios from "axios";
// import { isValidNodeName } from "@/lib/utils";
// import { useCurrentUser } from "@/auth/hooks/use-current-user";

// export const UploadFilesModal = () => {
//   const [isMounted, setIsMounted] = useState(false);
//   const uploadFilesModal = useUploadFilesModal();
//   const [file, setFile] = useState<File | null>(null); // Moved up
//   const [uploading, setUploading] = useState(false); //

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   if (!isMounted || !uploadFilesModal || !uploadFilesModal.nodeData) {
//     return null;
//   }

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!file) {
//       alert("Please select a file to upload.");
//       return;
//     }

//     setUploading(true);

//     const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/upload", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ filename: file.name, contentType: file.type }),
//     });

//     if (response.ok) {
//       const { url, fields } = await response.json();

//       const formData = new FormData();
//       Object.entries(fields).forEach(([key, value]) => {
//         formData.append(key, value as string);
//       });
//       formData.append("file", file);

//       const uploadResponse = await fetch(url, {
//         method: "POST",
//         body: formData,
//       });

//       if (uploadResponse.ok) {
//         alert("Upload successful!");
//       } else {
//         console.error("S3 Upload Error:", uploadResponse);
//         alert("Upload failed.");
//       }
//     } else {
//       alert("Failed to get pre-signed URL.");
//     }

//     setUploading(false);
//   };

//   return (
//     <AlertDialog open={uploadFilesModal.isOpen}>
//       <AlertDialogContent className="flex flex-col xs:max-w-[400px] max-h-[100vh] overflow-y-scroll">
//         <AlertDialogHeader>
//           <AlertDialogTitle className="whitespace-normal break-all">
//             Upload files to <span className="italic">{uploadFilesModal.nodeData.name}</span>? //{" "}
//           </AlertDialogTitle>
//           <div className="text-primary pt-2 overflow-y-scroll">
//             <form onSubmit={handleSubmit}>
//               <input
//                 id="file"
//                 type="file"
//                 onChange={(e) => {
//                   const files = e.target.files;
//                   if (files) {
//                     setFile(files[0]);
//                   }
//                 }}
//                 accept="image/png, image/jpeg"
//               />
//               <button type="submit" disabled={uploading}>
//                 Upload
//               </button>
//             </form>
//           </div>
//         </AlertDialogHeader>
//         <AlertDialogFooter>
//           <AlertDialogCancel disabled={false} onClick={uploadFilesModal.onClose} className="w-20 h-8 text-sm">
//             Cancel
//           </AlertDialogCancel>

//           <AlertDialogAction type="submit" className="w-20 h-8 text-sm">
//             Upload
//           </AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// };
