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

import { CardHeader, CardContent, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUploadInsuranceModal } from "../hooks/use-upload-insurance-modal";
import { Dropzone } from "@/components/files/dropzone";
import { useEffect, useState } from "react";
import { FileWithStatus } from "@/app/types/file-types";

export const UploadInsuranceModal = () => {
  const [isMounted, setIsMounted] = useState(false);
  const uploadInsuranceModal = useUploadInsuranceModal();
  const [front, setFront] = useState<FileWithStatus | null>(null);
  const [back, setBack] = useState<FileWithStatus | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    console.log(front);
  }, [front]);

  useEffect(() => {
    console.log(back);
  }, [back]);

  if (!isMounted || !uploadInsuranceModal) {
    return null;
  }

  return (
    <AlertDialog open={uploadInsuranceModal.isOpen}>
      <AlertDialogContent className="flex flex-col xs:max-w-[750px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Upload Insurance card</AlertDialogTitle>
          <AlertDialogDescription className="text-primary pt-2">
            <div className="grid gird-cols-1 sm:grid-cols-2 justify-center w-full max-w-[750px]">
              <Card className="w-full max-w-sm md:max-w-md lg:max-w-sm flex-1">
                <CardHeader>
                  <h2 className="text-base font-semibold">Front</h2>
                  <p className="text-sm font-normal leading-none text-gray-500 dark:text-gray-400">
                    Upload the front of your card
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  {front ? (
                    <img src={URL.createObjectURL(front.file)} alt="Front of insurance card" />
                  ) : (
                    <Dropzone forInsurance={true} onChangeSingle={setFront} />
                  )}
                </CardContent>
              </Card>
              <Card className="w-full max-w-sm md:max-w-md lg:max-w-sm flex-1">
                <CardHeader>
                  <h2 className="text-base font-semibold">Back</h2>
                  <p className="text-sm font-normal leading-none text-gray-500 dark:text-gray-400">
                    Upload the back of your card
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  {back ? (
                    <img src={URL.createObjectURL(back.file)} alt="Back of insurance card" />
                  ) : (
                    <Dropzone forInsurance={true} onChangeSingle={setBack} />
                  )}
                </CardContent>
              </Card>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={uploadInsuranceModal.onClose} className="w-20 h-8 text-sm">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => {}} className="w-20 h-8 text-sm">
            Upload
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
