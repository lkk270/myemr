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
import { Button } from "@/components/ui/button";
import { useUploadFilesModal } from "../hooks/use-upload-files-modal";
import { useFolderStore } from "../../../hooks/use-folders";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
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

    return (a: any, beforeFileList: any[]) => {
      console.log(beforeFileList);
      const startingFilesLength = fileList.length;
      const totalFilesCount = startingFilesLength + beforeFileList.length;
      if (startingFilesLength === 10 && !toastShown) {
        toast.error("You have already selected 10 files - only 10 files can be uploaded at a time!", {
          duration: 3000,
        });
        toastShown = true;
      }
      if (totalFilesCount > 10) {
        if (!toastShown) {
          if (startingFilesLength === 0) {
            toast.error(`Can only upload 10 files at a time. Only taking the first 10 selected files`, {
              duration: 3000,
            });
            toastShown = true;
          } else {
            const availableSlots = 10 - startingFilesLength;
            toast.error(
              `Can only upload 10 files at a time. Only taking the first ${availableSlots} additional files.`,
              {
                duration: 3000,
              },
            );
            toastShown = true;
          }
        }

        const filesToAdd = beforeFileList.slice(0, 10 - fileList.length);
        setFileList([...fileList, ...filesToAdd]);
        return false;
      }

      setFileList([...fileList, ...beforeFileList]);
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

  const handleUpload = () => {
    const formData = new FormData();
    const tempFileList = _.defaultsDeep(fileList);
    console.log(tempFileList);
    fileList.forEach((file, index) => {
      formData.append("files[]", file as FileType);
      tempFileList[index].status = "uploading";
    });
    console.log(tempFileList);
    setUploading(true);
    // You can use any AJAX library you like
    fetch("https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        setFileList(tempFileList);
        message.success("upload successfully.");
      })
      .catch(() => {
        message.error("upload failed.");
      })
      .finally(() => {
        setUploading(false);
      });
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
                Click or drag file to this area to upload. 10 files can be uploaded at a time.
              </p>
            </Dragger>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={uploadFilesModal.onClose} className="w-20 h-8 text-sm">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
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
