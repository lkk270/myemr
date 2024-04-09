"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { accessCodeType } from "@/app/types";

interface InvalidateCodeButtonProps {
  codeId: string;
  children: React.ReactNode;
  asChild?: boolean;
  codeType: "patientProfileAccessCode" | "requestRecordsCode";
  onInvalidate: (codeId: string, codeType: accessCodeType) => void;
}

export const InvalidateCodeButton = ({
  onInvalidate,
  codeId,
  children,
  asChild,
  codeType,
}: InvalidateCodeButtonProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={asChild}>{children}</AlertDialogTrigger>
      <AlertDialogContent className="flex flex-col xs:max-w-[400px]">
        <AlertDialogTitle className="text-md">Invalidate this code?</AlertDialogTitle>
        <AlertDialogDescription className="text-sm">
          {`By clicking "Invalidate", this code will be invalidated, and all active access sessions will be revoked. This
          action cannot be undone.`}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel className="w-20 h-8 text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onInvalidate(codeId, codeType);
            }}
            className="w-20 h-8 text-sm bg-secondary hover:bg-[#fdf0ef] dark:hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
          >
            Invalidate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
